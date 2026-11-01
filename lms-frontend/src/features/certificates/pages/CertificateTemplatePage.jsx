import { useEffect, useMemo, useState } from 'react';

import { AdminButton } from '../../../components/ui/AdminButton';
import { AdminInput } from '../../../components/ui/AdminInput';
import { courseService } from '../../courses/services/courseService';
import { certificateTemplateService } from '../services/certificateTemplateService';

const EMPTY = {
  courseId: '',
  name: '',
  fieldLayout:
    '{\n  "learnerFullName": { "page": 1, "x": 421, "y": 330, "fontSize": 24, "align": "CENTER" },\n' +
    '  "courseTitle":     { "page": 1, "x": 421, "y": 280, "fontSize": 16, "align": "CENTER" },\n' +
    '  "issuedOn":        { "page": 1, "x": 421, "y": 240, "fontSize": 12, "align": "CENTER" },\n' +
    '  "serialNumber":    { "page": 1, "x": 421, "y": 200, "fontSize": 10, "align": "CENTER" }\n}',
};

/**
 * Certificate template setup.
 *
 * <p>Mirrors the issuing rules so that what an administrator sees matches what
 * will happen: a template is a draft until it is published, only a published
 * template issues certificates, and publishing one releases any certificates
 * that were waiting on it.
 */
export default function CertificateTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refresh = async () => {
    try {
      const response = await certificateTemplateService.list();
      setTemplates(Array.isArray(response?.data) ? response.data : (response?.data?.data ?? []));
    } catch (err) {
      setError(readError(err, 'Could not load certificate templates.'));
    }
  };

  useEffect(() => {
    // Guarded so a response arriving after the page closes does not set state
    // on an unmounted component.
    let cancelled = false;

    const load = async () => {
      try {
        const response = await certificateTemplateService.list();
        if (cancelled) return;
        setTemplates(Array.isArray(response?.data) ? response.data : (response?.data?.data ?? []));
      } catch (err) {
        if (!cancelled) setError(readError(err, 'Could not load certificate templates.'));
      }

      try {
        const response = await courseService.list({ size: 200 });
        if (cancelled) return;
        const payload = response?.data?.data ?? response?.data ?? {};
        setCourses(payload.content ?? (Array.isArray(payload) ? payload : []));
      } catch {
        if (!cancelled) setCourses([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const courseName = useMemo(() => {
    const byId = new Map(courses.map((c) => [c.id, c.title]));
    return (id) => (id ? (byId.get(id) ?? 'Unknown course') : 'Organisation fallback');
  }, [courses]);

  const run = async (label, work) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
      await refresh();
      setNotice(label);
    } catch (err) {
      setError(readError(err, `${label} failed.`));
    } finally {
      setBusy(false);
    }
  };

  const upload = (event) => {
    event.preventDefault();
    if (!file) {
      setError('Choose the certificate PDF to upload.');
      return;
    }
    if (!isValidLayout(values.fieldLayout)) {
      setError('Field positions must be valid JSON.');
      return;
    }
    run('Template uploaded', () =>
      certificateTemplateService.uploadInstitutionPdf(
        {
          courseId: values.courseId || null,
          name: values.name?.trim() || 'Certificate template',
          sourceType: 'INSTITUTION_PDF',
          fieldLayout: values.fieldLayout,
          isDefault: false,
        },
        file,
      ),
    ).then(() => {
      setValues(EMPTY);
      setFile(null);
    });
  };

  // Opened rather than downloaded: the point is to look at it before deciding.
  const preview = async (id) => {
    setError('');
    try {
      const response = await certificateTemplateService.preview(id);
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(readError(err, 'Could not render a preview.'));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
      <header>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Certificate Templates</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 4 }}>
          Upload your certificate PDF, mark where the learner details go, preview it, then publish
          it for a course. Certificates earned before a template is published are held and issued
          automatically once you publish one.
        </p>
      </header>

      {error ? <Banner tone="error">{error}</Banner> : null}
      {notice ? <Banner tone="success">{notice}</Banner> : null}

      <form
        onSubmit={upload}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 14,
          }}
        >
          <div className="w-full">
            <label
              className="block mb-1.5 text-[13px] font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Course
            </label>
            <select
              value={values.courseId}
              onChange={(e) => setValues({ ...values, courseId: e.target.value })}
              className="w-full h-[38px] rounded-xl text-sm px-3 outline-none"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="">Organisation fallback (all courses)</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <AdminInput
            label="Template name"
            placeholder="e.g. Diploma 2026"
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
          />

          <div className="w-full">
            <label
              className="block mb-1.5 text-[13px] font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Certificate PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div className="w-full">
          <label
            className="block mb-1.5 text-[13px] font-medium"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Field positions
          </label>
          <textarea
            rows={8}
            value={values.fieldLayout}
            onChange={(e) => setValues({ ...values, fieldLayout: e.target.value })}
            spellCheck={false}
            className="w-full rounded-xl text-xs p-3 outline-none font-mono"
            style={{
              background: 'var(--card)',
              border: `1px solid ${isValidLayout(values.fieldLayout) ? 'var(--border)' : 'var(--color-red-300)'}`,
              color: 'var(--foreground)',
            }}
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Coordinates are measured from the bottom-left of the page, in points. Preview after
            uploading to check the placement.
          </p>
        </div>

        <div>
          <AdminButton type="submit" disabled={busy}>
            {busy ? 'Working…' : 'Upload template'}
          </AdminButton>
        </div>
      </form>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600 }}>Existing templates</h2>
        {templates.length === 0 ? (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            No templates yet. Certificates for any completed course will be held until you publish
            one.
          </p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '12px 14px',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {template.name}{' '}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: template.published
                        ? 'var(--color-green-100, #dcfce7)'
                        : 'var(--muted, #f1f5f9)',
                      color: template.published ? '#166534' : 'var(--muted-foreground)',
                    }}
                  >
                    {template.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                  {courseName(template.courseId)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <AdminButton variant="secondary" onClick={() => preview(template.id)}>
                  Preview
                </AdminButton>
                {template.published ? (
                  <AdminButton
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run('Template unpublished', () =>
                        certificateTemplateService.unpublish(template.id),
                      )
                    }
                  >
                    Unpublish
                  </AdminButton>
                ) : (
                  <AdminButton
                    disabled={busy}
                    onClick={() =>
                      run('Template published', () =>
                        certificateTemplateService.publish(template.id),
                      )
                    }
                  >
                    Publish
                  </AdminButton>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

const Banner = ({ tone, children }) => (
  <div
    style={{
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 13,
      background: tone === 'error' ? 'var(--color-red-50, #fef2f2)' : 'var(--color-green-50, #f0fdf4)',
      color: tone === 'error' ? 'var(--color-red-700, #b91c1c)' : '#166534',
    }}
  >
    {children}
  </div>
);

const isValidLayout = (text) => {
  if (!text?.trim()) return true;
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
};

const readError = (err, fallback) =>
  err?.response?.data?.message ?? err?.message ?? fallback;
