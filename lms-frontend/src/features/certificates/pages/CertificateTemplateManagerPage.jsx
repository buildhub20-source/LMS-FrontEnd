import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';
import certificateTemplateService from '../services/certificateTemplateService';

const defaultPlacement = { page: 1, x: 421, y: 330, fontSize: 24, align: 'CENTER' };
const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14,
};

export const CertificateTemplateManagerPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', isDefault: true, ...defaultPlacement });

  // Preview state
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('sample');

  const fieldLayout = useMemo(() => JSON.stringify({
    learnerFullName: { page: Number(form.page), x: Number(form.x), y: Number(form.y), fontSize: Number(form.fontSize), align: form.align },
  }), [form]);

  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await certificateTemplateService.list());
    } catch {
      toast.error('Could not load certificate templates. Check the certificate service connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handlePreview = async (template) => {
    setPreviewTemplate(template);
    setPreviewTab('sample');
    setPreviewLoading(true);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    try {
      const response = await certificateTemplateService.preview(template.id);
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to generate template preview', err);
      if (template.pdfTemplateUrl) {
        setPreviewUrl(template.pdfTemplateUrl);
        setPreviewTab('original');
        toast.info('Loaded original template PDF.');
      } else {
        toast.error('Could not generate preview for this template.');
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewTemplate(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return toast.error('Choose the institution certificate PDF first.');
    if (file.type !== 'application/pdf') return toast.error('Only PDF files can be used as certificate templates.');
    if (!form.name.trim()) return toast.error('Enter a template name.');
    setSubmitting(true);
    try {
      await certificateTemplateService.uploadInstitutionPdf({
        file,
        template: { name: form.name.trim(), sourceType: 'INSTITUTION_PDF', fieldLayout, isDefault: form.isDefault },
      });
      toast.success('Institution template uploaded. New course certificates will use its learner-name placement.');
      setFile(null);
      setForm({ name: '', isDefault: true, ...defaultPlacement });
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message ?? 'Template upload failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (template) => {
    try {
      await certificateTemplateService.setDefault(template.id);
      toast.success(`"${template.name}" is now the default certificate for all course completions.`);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to set template as default.');
    }
  };

  const handleCreateDynamicTemplate = async () => {
    try {
      await certificateTemplateService.createLmsRendered({
        name: 'Platform Dynamic Template (Org Branded)',
        isDefault: true,
      });
      toast.success('Platform dynamic template enabled and set as default.');
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to enable dynamic template.');
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`Delete the template "${template.name}"? Existing learner certificates will remain available.`)) return;
    try {
      await certificateTemplateService.remove(template.id);
      toast.success('Template removed.');
      await load();
    } catch {
      toast.error('Could not delete this template.');
    }
  };

  return (
    <PageContainer
      title="E-Certificate templates"
      subtitle="Upload reusable institution PDFs and define where each learner name appears."
      actions={<Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, .75fr)', gap: 24 }}>
        <section style={{ padding: 24, border: '1px solid var(--border-color)', borderRadius: 14, background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 22 }}>
            <span style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: 10, background: 'rgba(59,130,246,.13)', color: '#3b82f6' }}><FileUp size={20} /></span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>Upload institution PDF</h2>
              <p style={{ margin: '5px 0 0', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>The original is preserved. LMS produces a separate personalised PDF only after a learner completes the course.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
            <label style={{ display: 'grid', gap: 7, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Template name
              <input style={inputStyle} value={form.name} placeholder="e.g. 2026 course completion certificate" onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label style={{ display: 'grid', gap: 7, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              Certificate PDF
              <input style={inputStyle} type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{file ? `${file.name} (${Math.ceil(file.size / 1024)} KB)` : 'PDF only, maximum 15 MB.'}</span>
            </label>
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: 'var(--text-primary)' }}>Learner name placement</h3>
              <p style={{ margin: '5px 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>Coordinates use PDF points from the lower-left corner. Start with the centered defaults, then refine after the first issued certificate.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
                {[['page', 'Page'], ['x', 'X position'], ['y', 'Y position'], ['fontSize', 'Font size']].map(([key, label]) => (
                  <label key={key} style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {label}
                    <input style={inputStyle} type="number" min="1" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
                  </label>
                ))}
              </div>
              <label style={{ display: 'grid', gap: 6, marginTop: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                Alignment
                <select style={inputStyle} value={form.align} onChange={(event) => setForm({ ...form, align: event.target.value })}>
                  <option value="CENTER">Centered</option><option value="LEFT">Left</option><option value="RIGHT">Right</option>
                </select>
              </label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />
              Use this as the default template for future course-completion certificates
            </label>
            <Button variant="primary" type="submit" isLoading={submitting} iconLeft={submitting ? <LoaderCircle size={16} /> : <Award size={16} />}>
              Upload template
            </Button>
          </form>
        </section>

        <aside style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 14, background: 'var(--surface-medium)' }}>
            <ShieldCheck size={21} color="#22c55e" />
            <h2 style={{ margin: '10px 0 6px', fontSize: 16, color: 'var(--text-primary)' }}>Safe generation</h2>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-muted)' }}>The source document is never changed. Each issued certificate receives its own file, serial number, and R2 path.</p>
          </div>
          <div style={{ padding: 20, border: '1px solid var(--border-color)', borderRadius: 14, background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>Your templates</h2>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active default is issued upon course completion</span>
              </div>
              <button aria-label="Refresh templates" onClick={load} style={{ border: 0, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><RefreshCw size={17} /></button>
            </div>
            {loading ? <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 14 }}>Loading templates...</p> : templates.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5, marginTop: 14 }}>No templates available.</p> : (
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                {templates.map((template) => (
                  <div key={template.id} style={{ padding: 12, border: template.isDefault ? '1.5px solid #22c55e' : '1px solid var(--border-color)', borderRadius: 10, background: template.isDefault ? 'rgba(34, 197, 94, 0.04)' : 'var(--surface-medium)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'start', justifyContent: 'space-between' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                          {template.name}
                        </strong>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {template.sourceType === 'INSTITUTION_PDF' ? 'Institution PDF' : 'LMS Dynamic (Org Branded)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {!template.isDefault && (
                          <button
                            type="button"
                            title="Set as default template for course completions"
                            onClick={() => handleSetDefault(template)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid #16a34a',
                              background: 'rgba(22, 163, 74, 0.08)',
                              color: '#16a34a',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            Set default
                          </button>
                        )}
                        <button
                          type="button"
                          title="Preview certificate"
                          onClick={() => handlePreview(template)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 9px',
                            borderRadius: 6,
                            border: '1px solid var(--border-color)',
                            background: 'var(--surface-dark)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                        >
                          <Eye size={13} />
                          Preview
                        </button>
                        <button
                          type="button"
                          title="Delete template"
                          onClick={() => handleDelete(template)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: 4,
                            borderRadius: 6,
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {template.isDefault ? (
                      <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', marginTop: 8, color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                        <CheckCircle2 size={13} /> Default &bull; Used for course completions
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {!loading && !templates.some((t) => t.sourceType === 'LMS_RENDERED') && (
              <div style={{ marginTop: 16, padding: 14, border: '1px dashed #3b82f6', borderRadius: 10, background: 'rgba(59, 130, 246, 0.05)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Platform Built-in Template
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Automatically brands certificates using your Organization Logo, Name, and Colors from Org Settings.
                </p>
                <button
                  type="button"
                  onClick={handleCreateDynamicTemplate}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #3b82f6',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Enable Dynamic Org Template
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Certificate Preview Modal */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={closePreview}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 960,
              maxHeight: '92vh',
              background: 'var(--surface-dark, #121212)',
              border: '1px solid var(--border-color, #27272a)',
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color)',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'grid', placeItems: 'center', width: 34, height: 34,
                  borderRadius: 8, background: 'rgba(59,130,246,0.15)', color: '#3b82f6'
                }}>
                  <Award size={18} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {previewTemplate.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {previewTemplate.sourceType === 'INSTITUTION_PDF' ? 'Institution PDF Template' : 'Platform LMS Rendered'}
                    </span>
                    {previewTemplate.isDefault && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '1px 6px', borderRadius: 4 }}>
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {previewTemplate.pdfTemplateUrl && (
                  <div style={{ display: 'flex', background: 'var(--surface-medium)', borderRadius: 8, padding: 2, border: '1px solid var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTab('sample');
                        if (!previewUrl || !previewUrl.startsWith('blob:')) {
                          handlePreview(previewTemplate);
                        }
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: previewTab === 'sample' ? '#3b82f6' : 'transparent',
                        color: previewTab === 'sample' ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Sample Certificate
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab('original')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: previewTab === 'original' ? '#3b82f6' : 'transparent',
                        color: previewTab === 'original' ? '#fff' : 'var(--text-muted)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Original PDF
                    </button>
                  </div>
                )}

                {/* Open in new tab */}
                {(previewTab === 'original' ? previewTemplate.pdfTemplateUrl : previewUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = previewTab === 'original' ? previewTemplate.pdfTemplateUrl : previewUrl;
                      window.open(target, '_blank', 'noopener,noreferrer');
                    }}
                    title="Open in new window"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 10px',
                      borderRadius: 7,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface-medium)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <ExternalLink size={13} />
                    Open Tab
                  </button>
                )}

                {/* Download */}
                {(previewTab === 'original' ? previewTemplate.pdfTemplateUrl : previewUrl) && (
                  <a
                    href={previewTab === 'original' ? previewTemplate.pdfTemplateUrl : previewUrl}
                    download={`${previewTemplate.name.replace(/\s+/g, '_')}_preview.pdf`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 10px',
                      borderRadius: 7,
                      border: '1px solid var(--border-color)',
                      background: 'var(--surface-medium)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={13} />
                    Download
                  </a>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closePreview}
                  title="Close preview"
                  style={{
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 6,
                    borderRadius: 6,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', background: '#0e0e11', overflow: 'hidden' }}>
              {previewLoading ? (
                <div style={{ flex: 1, minHeight: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <LoaderCircle size={32} className="animate-spin" style={{ color: '#3b82f6' }} />
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Generating sample certificate with learner name placement...</p>
                </div>
              ) : (
                <iframe
                  src={previewTab === 'original' ? previewTemplate.pdfTemplateUrl : previewUrl}
                  title={`Preview of ${previewTemplate.name}`}
                  style={{
                    width: '100%',
                    height: '70vh',
                    minHeight: 480,
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    background: '#18181b',
                  }}
                />
              )}
            </div>

            {/* Modal Footer Note */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-color)', background: 'var(--surface-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              <span>
                {previewTab === 'original'
                  ? 'Viewing original institution PDF without name overlay.'
                  : 'Sample preview showing learner name stamped at the configured coordinates.'}
              </span>
              <button
                type="button"
                onClick={closePreview}
                style={{
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-medium)',
                  color: 'var(--text-primary)',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default CertificateTemplateManagerPage;
