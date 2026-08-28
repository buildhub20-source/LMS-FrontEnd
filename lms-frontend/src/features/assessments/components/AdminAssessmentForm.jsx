import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Calendar, AlignLeft, Info } from 'lucide-react';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { assessmentSchema } from '../validation/assessmentSchemas';
import s from './AssessmentForms.module.css';

const toLocal = (iso) => (iso ? iso.slice(0, 16) : '');

export const AdminAssessmentForm = ({
  defaultValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save assessment',
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      title: '', description: '', durationMinutes: 60, maxAttempts: 1,
      startTime: '', endTime: '',
      ...defaultValues,
      startTime: toLocal(defaultValues.startTime),
      endTime: toLocal(defaultValues.endTime),
    },
  });

  const watched = watch(['title', 'durationMinutes', 'maxAttempts']);

  const submit = (data) => onSubmit({
    ...data,
    startTime: data.startTime ? new Date(data.startTime).toISOString() : null,
    endTime:   data.endTime   ? new Date(data.endTime).toISOString()   : null,
  });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className={s.page}>

        {/* ── LEFT: form sections ──────────────────────── */}
        <div className={s.formCol}>

          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert tone="error">{error?.response?.data?.message ?? error?.message}</Alert>
            </div>
          )}

          {/* Basic info */}
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionIcon}><AlignLeft size={16} /></div>
              <div className={s.sectionMeta}>
                <p className={s.sectionTitle}>Basic Information</p>
                <p className={s.sectionDesc}>Title and description shown to students</p>
              </div>
            </div>
            <div className={s.sectionBody}>
              <Input
                label="Assessment Title" required
                placeholder="e.g. Java Collections Mid-Term"
                error={errors.title?.message}
                {...register('title')}
              />
              <TextArea
                label="Description" rows={4}
                placeholder="Describe what this assessment covers, rules, grading criteria…"
                hint="Optional — displayed to students before they begin"
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>

          {/* Timing */}
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionIcon}><Clock size={16} /></div>
              <div className={s.sectionMeta}>
                <p className={s.sectionTitle}>Duration &amp; Attempts</p>
                <p className={s.sectionDesc}>Control how long students have and how often they can try</p>
              </div>
            </div>
            <div className={s.sectionBody}>
              <div className={s.row2}>
                <Input
                  label="Duration (minutes)" type="number" min={1} max={1440} required
                  hint="1 – 1440 min (max 24 h)"
                  error={errors.durationMinutes?.message}
                  {...register('durationMinutes')}
                />
                <Input
                  label="Max Attempts" type="number" min={1} max={10} required
                  hint="How many times can a student attempt"
                  error={errors.maxAttempts?.message}
                  {...register('maxAttempts')}
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className={s.section}>
            <div className={s.sectionHead}>
              <div className={s.sectionIcon}><Calendar size={16} /></div>
              <div className={s.sectionMeta}>
                <p className={s.sectionTitle}>Availability Window</p>
                <p className={s.sectionDesc}>Restrict when students can access this assessment (optional)</p>
              </div>
            </div>
            <div className={s.sectionBody}>
              <div className={s.row2}>
                <Input
                  label="Opens At" type="datetime-local"
                  hint="Leave blank — always open"
                  error={errors.startTime?.message}
                  {...register('startTime')}
                />
                <Input
                  label="Closes At" type="datetime-local"
                  hint="Leave blank — no deadline"
                  error={errors.endTime?.message}
                  {...register('endTime')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className={s.actions}>
            <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            )}
          </div>
        </div>

        {/* ── RIGHT: sidebar ───────────────────────────── */}
        <div className={s.sideCol}>

          {/* Live preview */}
          <div className={s.previewCard}>
            <p className={s.previewTitle}>Preview</p>
            <div className={s.previewRow}>
              <span className={s.previewLabel}>Title</span>
              <span className={s.previewVal}>{watched[0] || '—'}</span>
            </div>
            <div className={s.previewRow}>
              <span className={s.previewLabel}>Duration</span>
              <span className={s.previewVal}>{watched[1] || 60} min</span>
            </div>
            <div className={s.previewRow}>
              <span className={s.previewLabel}>Attempts</span>
              <span className={s.previewVal}>{watched[2] || 1}</span>
            </div>
            <div className={s.previewRow}>
              <span className={s.previewLabel}>Marks</span>
              <span className={s.previewVal}>Auto-computed</span>
            </div>
          </div>

          {/* Tips */}
          <div className={s.helpCard}>
            <div className={s.helpCardHead}>Tips</div>
            <div className={s.helpItem}>
              <div className={s.helpDot} />
              <p className={s.helpText}><strong>Marks are automatic.</strong> Total marks are summed from all question marks — no manual input needed.</p>
            </div>
            <div className={s.helpItem}>
              <div className={s.helpDot} />
              <p className={s.helpText}><strong>Scheduling is optional.</strong> Leave blank to let students attempt anytime after publishing.</p>
            </div>
            <div className={s.helpItem}>
              <div className={s.helpDot} />
              <p className={s.helpText}><strong>Add questions after saving.</strong> You'll be taken to the assessment page to add coding problems.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminAssessmentForm;
