import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Code2, Zap, Plus, Trash2, Eye, EyeOff, CheckSquare } from 'lucide-react';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { questionSchema } from '../validation/assessmentSchemas';
import { DIFFICULTY_OPTIONS } from '../constants/assessmentConstants';
import s from './AssessmentForms.module.css';

const EMPTY_TC = { inputData: '', expectedOutput: '', sample: false, hidden: true, weight: 1 };

const EMPTY_Q = {
  title: '',
  description: '',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  difficulty: 'MEDIUM',
  marks: 10,
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  testCases: [{ inputData: '', expectedOutput: '', sample: true, hidden: false, weight: 1 }],
};

export const AdminQuestionForm = ({
  defaultValues = EMPTY_Q,
  onSubmit,
  onCancel,
  submitLabel = 'Save question',
  error = null,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: { ...EMPTY_Q, ...defaultValues },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'testCases' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="error">{error?.response?.data?.message ?? error?.message}</Alert>
        </div>
      )}

      {/* ── Problem Statement ─────────────────────────────────────── */}
      <div className={s.qSection}>
        <div className={s.qSectionHead}>
          <span className={s.qSectionTitle}>
            <span className={s.qSectionNum}>1</span>
            Problem Statement
          </span>
        </div>
        <div className={s.qSectionBody}>
          <Input
            label="Question Title"
            required
            placeholder="e.g. Two Sum, Reverse a String…"
            error={errors.title?.message}
            {...register('title')}
          />
          <TextArea
            label="Problem Description"
            rows={6}
            required
            placeholder="Describe the problem clearly. Include examples if needed."
            error={errors.description?.message}
            {...register('description')}
          />
          <div className={s.row2}>
            <TextArea
              label="Input Format"
              rows={3}
              placeholder="Describe the input format"
              error={errors.inputFormat?.message}
              {...register('inputFormat')}
            />
            <TextArea
              label="Output Format"
              rows={3}
              placeholder="Describe the expected output"
              error={errors.outputFormat?.message}
              {...register('outputFormat')}
            />
          </div>
          <TextArea
            label="Constraints"
            rows={2}
            placeholder="e.g. 1 ≤ N ≤ 10⁵, time: 2 s, memory: 256 MB"
            error={errors.constraints?.message}
            {...register('constraints')}
          />
        </div>
      </div>

      {/* ── Scoring & Limits ─────────────────────────────────────── */}
      <div className={s.qSection}>
        <div className={s.qSectionHead}>
          <span className={s.qSectionTitle}>
            <span className={s.qSectionNum}>2</span>
            Scoring &amp; Execution Limits
          </span>
        </div>
        <div className={s.qSectionBody}>
          <div className={s.row}>
            <Select
              label="Difficulty"
              required
              options={DIFFICULTY_OPTIONS}
              error={errors.difficulty?.message}
              {...register('difficulty')}
            />
            <Input
              label="Marks"
              type="number"
              min={1}
              max={100}
              required
              hint="1–100 marks"
              error={errors.marks?.message}
              {...register('marks')}
            />
            <Input
              label="Time Limit"
              type="number"
              min={100}
              max={10000}
              required
              hint="100–10 000 ms"
              error={errors.timeLimitMs?.message}
              {...register('timeLimitMs')}
            />
            <Input
              label="Memory Limit"
              type="number"
              min={16}
              max={1024}
              required
              hint="16–1024 MB"
              error={errors.memoryLimitMb?.message}
              {...register('memoryLimitMb')}
            />
          </div>
        </div>
      </div>

      {/* ── Test Cases ───────────────────────────────────────────── */}
      <div className={s.qSection}>
        <div className={s.qSectionHead}>
          <span className={s.qSectionTitle}>
            <span className={s.qSectionNum}>3</span>
            Test Cases
          </span>
          {errors.testCases?.message && (
            <span className={s.tcError}>{errors.testCases.message}</span>
          )}
        </div>
        <div className={s.qSectionBody}>
          {fields.map((field, index) => {
            const isSample = watch(`testCases.${index}.sample`);
            return (
              <div key={field.id} className={`${s.tcCard} ${isSample ? s.sample : ''}`}>
                <div className={s.tcCardHead}>
                  <span className={s.tcLabel}>
                    Test Case {index + 1}
                    {isSample && <span className={s.samplePill}>Sample</span>}
                  </span>
                  {fields.length > 1 && (
                    <Button variant="ghost" size="sm" type="button" onClick={() => remove(index)}>
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
                <div className={s.tcCardBody}>
                  <TextArea
                    label="Input Data"
                    rows={3}
                    placeholder="Leave blank if no stdin input"
                    error={errors.testCases?.[index]?.inputData?.message}
                    {...register(`testCases.${index}.inputData`)}
                  />
                  <TextArea
                    label="Expected Output"
                    rows={3}
                    required
                    placeholder="Exact expected stdout output"
                    error={errors.testCases?.[index]?.expectedOutput?.message}
                    {...register(`testCases.${index}.expectedOutput`)}
                  />
                  <div className={s.tcToggleRow}>
                    <label className={s.tcToggle}>
                      <input type="checkbox" {...register(`testCases.${index}.sample`)} />
                      <Eye size={13} /> Visible to student
                    </label>
                    <label className={s.tcToggle}>
                      <input type="checkbox" {...register(`testCases.${index}.hidden`)} />
                      <EyeOff size={13} /> Hidden (graded only)
                    </label>
                    <div className={s.tcWeightWrap}>
                      <span>Weight</span>
                      <div className={s.tcWeightInput}>
                        <Input
                          type="number"
                          min={1}
                          error={errors.testCases?.[index]?.weight?.message}
                          {...register(`testCases.${index}.weight`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button type="button" className={s.addTcBtn} onClick={() => append({ ...EMPTY_TC })}>
            <Plus size={15} /> Add test case
          </button>
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className={s.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default AdminQuestionForm;
