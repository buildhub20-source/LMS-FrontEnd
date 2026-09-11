import { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Code2, Zap, Plus, Trash2, Eye, EyeOff, Settings, CheckCircle2, ListFilter, HelpCircle, Copy, CheckCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { questionSchema } from '../validation/assessmentSchemas';
import { DIFFICULTY_OPTIONS, COMPILER_OPTIONS } from '../constants/assessmentConstants';

const QUESTION_TYPE_OPTIONS = [
  { value: 'CODING', label: '💻 Coding Challenge' },
  { value: 'MULTIPLE_CHOICE', label: '🔘 Multiple Choice (MCQ)' },
];

const EMPTY_TC = { inputData: '', expectedOutput: '', sample: false, hidden: true, weight: 1 };
const EMPTY_OPTION = { optionText: '', isCorrect: false, explanation: '' };

const EMPTY_Q = {
  title: '',
  description: '',
  questionType: 'CODING',
  inputFormat: '',
  outputFormat: '',
  constraints: '',
  difficulty: 'MEDIUM',
  compiler: 'ALL',
  marks: 10,
  timeLimitMs: 2000,
  memoryLimitMb: 256,
  testCases: [{ inputData: '', expectedOutput: '', sample: true, hidden: false, weight: 1 }],
  options: [
    { optionText: '', isCorrect: true, explanation: '' },
    { optionText: '', isCorrect: false, explanation: '' },
  ],
};

const S = {
  card: {
    background: 'var(--surface-dark, #0a0a0a)',
    border: '1px solid var(--border-color, #222)',
    borderRadius: 12,
  },
  cardHeader: {
    background: 'var(--surface-medium, #141414)',
    borderBottom: '1px solid var(--border-color, #222)',
  },
  innerCard: {
    background: 'var(--surface-medium, #141414)',
    border: '1px solid var(--border-color, #222)',
    borderRadius: 8,
  },
  textPrimary: {
    color: 'var(--text-primary, #ffffff)',
  },
  textMuted: {
    color: 'var(--text-muted, #a1a1aa)',
  },
};

export const AdminQuestionForm = ({
  defaultValues = EMPTY_Q,
  onSubmit,
  onCancel,
  submitLabel = 'Save Question',
  error = null,
}) => {
  const initialValues = useMemo(() => ({
    ...EMPTY_Q,
    ...defaultValues,
    testCases: defaultValues?.testCases && defaultValues.testCases.length > 0 ? defaultValues.testCases : EMPTY_Q.testCases,
    options: defaultValues?.options && defaultValues.options.length > 0 ? defaultValues.options : EMPTY_Q.options,
  }), [defaultValues]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(questionSchema),
    values: initialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'testCases' });
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: 'options' });

  const questionType = watch('questionType') || 'CODING';
  const testCasesWatch = watch('testCases') || [];

  // Categorize into visible (sample) and hidden (graded) test cases
  const visibleCases = fields
    .map((field, originalIndex) => ({
      field,
      originalIndex,
      isSample: Boolean(testCasesWatch[originalIndex]?.sample),
      isHidden: testCasesWatch[originalIndex]?.hidden !== undefined ? Boolean(testCasesWatch[originalIndex]?.hidden) : false,
    }))
    .filter((item) => item.isSample && !item.isHidden);

  const hiddenCases = fields
    .map((field, originalIndex) => ({
      field,
      originalIndex,
      isSample: Boolean(testCasesWatch[originalIndex]?.sample),
      isHidden: testCasesWatch[originalIndex]?.hidden !== undefined ? Boolean(testCasesWatch[originalIndex]?.hidden) : true,
    }))
    .filter((item) => !item.isSample || item.isHidden);

  const handleAddVisibleCase = () => {
    append({
      inputData: '',
      expectedOutput: '',
      sample: true,
      hidden: false,
      weight: 1,
    });
  };

  const handleAddHiddenCase = () => {
    append({
      inputData: '',
      expectedOutput: '',
      sample: false,
      hidden: true,
      weight: 1,
    });
  };

  const handleAddMultipleHiddenCases = (count = 3) => {
    const newCases = Array.from({ length: count }, () => ({
      inputData: '',
      expectedOutput: '',
      sample: false,
      hidden: true,
      weight: 1,
    }));
    append(newCases);
  };

  const handleDuplicateTestCase = (originalIndex) => {
    const current = watch(`testCases.${originalIndex}`);
    append({
      inputData: current?.inputData || '',
      expectedOutput: current?.expectedOutput || '',
      sample: Boolean(current?.sample),
      hidden: current?.hidden !== undefined ? Boolean(current.hidden) : true,
      weight: current?.weight ? Number(current.weight) : 1,
    });
  };

  const handleMoveToHidden = (originalIndex) => {
    setValue(`testCases.${originalIndex}.sample`, false, { shouldValidate: true, shouldDirty: true });
    setValue(`testCases.${originalIndex}.hidden`, true, { shouldValidate: true, shouldDirty: true });
  };

  const handleMoveToVisible = (originalIndex) => {
    setValue(`testCases.${originalIndex}.sample`, true, { shouldValidate: true, shouldDirty: true });
    setValue(`testCases.${originalIndex}.hidden`, false, { shouldValidate: true, shouldDirty: true });
  };

  const renderTestCaseCard = (item, displayIndex, isVisibleCol) => {
    const { field, originalIndex } = item;
    return (
      <div 
        key={field.id} 
        style={S.innerCard}
        className="relative p-4 shadow-sm hover:shadow-md transition-shadow group/tc rounded-xl"
      >
        {/* Test Case Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span style={S.textPrimary} className="text-sm font-bold">
              {isVisibleCol ? `Sample ${displayIndex + 1}` : `Hidden ${displayIndex + 1}`}
            </span>
            <span className="text-[11px] font-medium text-gray-500">
              (Case #{originalIndex + 1})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Move between columns button */}
            {isVisibleCol ? (
              <button
                type="button"
                onClick={() => handleMoveToHidden(originalIndex)}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-purple-500/10 border border-purple-500/20"
                title="Move this case to Hidden (graded only)"
              >
                Make Hidden <ArrowRight size={12} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleMoveToVisible(originalIndex)}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-500/10 border border-blue-500/20"
                title="Move this case to Visible (student sample)"
              >
                <ArrowLeft size={12} /> Make Visible
              </button>
            )}

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={() => handleDuplicateTestCase(originalIndex)}
              className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-blue-500/10"
              title="Duplicate this test case"
            >
              <Copy size={14} />
            </button>

            {/* Remove Button */}
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(originalIndex)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-500/10"
                title="Remove test case"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Test Case I/O */}
        <div className="grid grid-cols-1 gap-3">
          <TextArea
            label="Input Data"
            rows={3}
            placeholder="Leave blank if no stdin input"
            error={errors.testCases?.[originalIndex]?.inputData?.message}
            {...register(`testCases.${originalIndex}.inputData`)}
          />
          <TextArea
            label="Expected Output"
            rows={3}
            placeholder="Exact expected stdout output"
            error={errors.testCases?.[originalIndex]?.expectedOutput?.message}
            {...register(`testCases.${originalIndex}.expectedOutput`)}
          />
        </div>

        {/* Hidden inputs to guarantee react-hook-form registration */}
        <input type="hidden" {...register(`testCases.${originalIndex}.sample`)} />
        <input type="hidden" {...register(`testCases.${originalIndex}.hidden`)} />

        {/* Weight & Visibility Info Row */}
        <div 
          style={{ background: 'var(--surface-dark, #0a0a0a)', borderColor: 'var(--border-color, #222)' }}
          className="flex items-center justify-between gap-3 mt-3.5 p-2.5 border rounded-lg"
        >
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            {isVisibleCol ? (
              <>
                <Eye size={13} className="text-blue-400" />
                <span className="text-blue-300 font-medium">Visible to student</span>
              </>
            ) : (
              <>
                <EyeOff size={13} className="text-purple-400" />
                <span className="text-purple-300 font-medium">Hidden (graded only)</span>
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            <span style={S.textMuted} className="text-xs font-semibold uppercase tracking-wider">Weight:</span>
            <div className="w-20">
              <Input
                type="number"
                min={1}
                error={errors.testCases?.[originalIndex]?.weight?.message}
                {...register(`testCases.${originalIndex}.weight`)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* ── MAIN WORKSPACE (Left Column) ── */}
      <div className="flex-1 w-full space-y-6">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-2">
            <Alert tone="error">{error?.response?.data?.message ?? error?.message}</Alert>
          </div>
        )}

        {/* Title Input (Seamless) */}
        <div 
          style={S.card}
          className="p-5 shadow-sm flex flex-col gap-2 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        >
          <input
            style={S.textPrimary}
            className="w-full bg-transparent text-xl font-bold placeholder:text-[var(--text-muted)] outline-none border-none p-0 focus:ring-0"
            placeholder="Question Title (e.g., Two Sum)..."
            {...register('title')}
          />
          {errors.title && <span className="text-sm text-red-500 font-medium">{errors.title.message}</span>}
        </div>

        {/* Problem Statement / Prompt Card */}
        <div style={S.card} className="shadow-sm overflow-hidden">
          <div style={S.cardHeader} className="px-6 py-4">
            <h3 style={S.textPrimary} className="text-base font-semibold flex items-center gap-2">
              {questionType === 'MULTIPLE_CHOICE' ? (
                <>
                  <ListFilter size={18} className="text-purple-500" /> Question Prompt
                </>
              ) : (
                <>
                  <Code2 size={18} className="text-blue-500" /> Problem Statement
                </>
              )}
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <TextArea
              label={questionType === 'MULTIPLE_CHOICE' ? 'Question Prompt / Description' : 'Description'}
              rows={questionType === 'MULTIPLE_CHOICE' ? 5 : 8}
              placeholder={questionType === 'MULTIPLE_CHOICE' ? 'Write the question prompt or problem clearly...' : 'Describe the problem clearly. Include examples if needed.'}
              error={errors.description?.message}
              {...register('description')}
            />
            {questionType === 'CODING' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <TextArea
                    label="Input Format"
                    rows={3}
                    placeholder="Describe the expected input structure"
                    error={errors.inputFormat?.message}
                    {...register('inputFormat')}
                  />
                  <TextArea
                    label="Output Format"
                    rows={3}
                    placeholder="Describe the expected output structure"
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
              </>
            )}
          </div>
        </div>

        {/* ── Multiple Choice Options Card ── */}
        {questionType === 'MULTIPLE_CHOICE' && (
          <div style={S.card} className="shadow-sm overflow-hidden">
            <div style={S.cardHeader} className="px-6 py-4 flex justify-between items-center">
              <div>
                <h3 style={S.textPrimary} className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-500" /> Answer Options
                </h3>
                <p style={S.textMuted} className="text-xs mt-0.5">
                  Click the letter badge to toggle whether an option is the correct answer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => appendOption({ ...EMPTY_OPTION })}
                className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-500/10"
              >
                <Plus size={15} /> Add Option
              </button>
            </div>

            <div className="p-6 space-y-4">
              {errors.options?.message && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-sm font-medium">
                  {errors.options.message}
                </div>
              )}

              {optionFields.map((field, index) => {
                const isCorrect = watch(`options.${index}.isCorrect`);
                const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                const letter = letters[index] || `#${index + 1}`;

                return (
                  <div
                    key={field.id}
                    style={{
                      background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'var(--surface-medium, #141414)',
                      borderColor: isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color, #222)',
                    }}
                    className="relative rounded-xl border p-4 transition-all shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {/* Correct Answer Checkbox Badge */}
                      <label
                        className="mt-1 flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-all border font-bold text-sm select-none shrink-0"
                        style={{
                          background: isCorrect ? '#10b981' : 'rgba(255,255,255,0.05)',
                          color: isCorrect ? '#ffffff' : 'inherit',
                          borderColor: isCorrect ? '#10b981' : 'rgba(255,255,255,0.2)',
                        }}
                        title={isCorrect ? 'Correct Answer (Click to uncheck)' : 'Click to mark as Correct Answer'}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          {...register(`options.${index}.isCorrect`)}
                        />
                        {letter}
                      </label>

                      {/* Option Text & Explanation */}
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder={`Option ${letter} text...`}
                          error={errors.options?.[index]?.optionText?.message}
                          {...register(`options.${index}.optionText`)}
                        />
                        <Input
                          placeholder="Explanation / feedback (optional, shown to student after submission)"
                          {...register(`options.${index}.explanation`)}
                        />
                      </div>

                      {/* Remove Option Button */}
                      {optionFields.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 shrink-0 mt-1"
                          title="Remove option"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Test Cases Card (Only for CODING questions) ── */}
        {questionType === 'CODING' && (
          <div style={S.card} className="shadow-sm overflow-hidden">
            {/* Global Header */}
            <div style={S.cardHeader} className="px-6 py-4 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <h3 style={S.textPrimary} className="text-base font-semibold flex items-center gap-2">
                  <Zap size={18} className="text-yellow-500" /> Test Cases Management
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-gray-300">
                  {fields.length} Total ({visibleCases.length} Visible, {hiddenCases.length} Hidden)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddVisibleCase}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-500/10 border border-blue-500/20"
                >
                  <Plus size={14} /> Add Visible Sample
                </button>
                <button
                  type="button"
                  onClick={handleAddHiddenCase}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-500/10 border border-purple-500/20"
                >
                  <Plus size={14} /> Add Hidden Case
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {errors.testCases?.message && (
                <span className="text-sm font-medium text-red-500 block mb-4">{errors.testCases.message}</span>
              )}

              {/* Two Separate Columns Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                
                {/* ── COLUMN 1: VISIBLE / SAMPLE TEST CASES ── */}
                <div 
                  style={{ background: 'rgba(59, 130, 246, 0.03)', borderColor: 'rgba(59, 130, 246, 0.2)' }}
                  className="rounded-2xl border p-4.5 flex flex-col gap-4"
                >
                  {/* Column 1 Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                        <Eye size={18} />
                      </div>
                      <div>
                        <h4 style={S.textPrimary} className="text-sm font-bold flex items-center gap-2">
                          Visible to Students (Sample)
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                            {visibleCases.length}
                          </span>
                        </h4>
                        <p style={S.textMuted} className="text-[11px] mt-0.5">
                          Shown in problem statement for testing solution before submission
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddVisibleCase}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all shrink-0"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>

                  {/* Column 1 List */}
                  <div className="space-y-4">
                    {visibleCases.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-blue-500/30 rounded-xl bg-blue-500/[0.02]">
                        <Eye size={28} className="mx-auto text-blue-400/40 mb-2" />
                        <p style={S.textPrimary} className="text-xs font-semibold">No visible sample test cases</p>
                        <p style={S.textMuted} className="text-[11px] mt-1 mb-3">Add at least one sample case so students know the exact format</p>
                        <button 
                          type="button" 
                          onClick={handleAddVisibleCase} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-all"
                        >
                          <Plus size={13} /> Add Sample Case
                        </button>
                      </div>
                    ) : (
                      visibleCases.map((item, idx) => renderTestCaseCard(item, idx, true))
                    )}
                  </div>

                  {/* Column 1 Bottom Add Button */}
                  {visibleCases.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddVisibleCase}
                      className="w-full py-2.5 rounded-xl border border-dashed border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all mt-1"
                    >
                      <Plus size={14} /> Add Another Visible Case
                    </button>
                  )}
                </div>

                {/* ── COLUMN 2: HIDDEN / GRADED TEST CASES ── */}
                <div 
                  style={{ background: 'rgba(168, 85, 247, 0.03)', borderColor: 'rgba(168, 85, 247, 0.2)' }}
                  className="rounded-2xl border p-4.5 flex flex-col gap-4"
                >
                  {/* Column 2 Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                        <EyeOff size={18} />
                      </div>
                      <div>
                        <h4 style={S.textPrimary} className="text-sm font-bold flex items-center gap-2">
                          Hidden Test Cases (Graded Only)
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                            {hiddenCases.length}
                          </span>
                        </h4>
                        <p style={S.textMuted} className="text-[11px] mt-0.5">
                          Secret test suite evaluated only during final submission
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAddMultipleHiddenCases(3)}
                        className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-medium"
                        title="Add 3 hidden cases at once"
                      >
                        + 3
                      </button>
                      <button
                        type="button"
                        onClick={handleAddHiddenCase}
                        className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Column 2 List */}
                  <div className="space-y-4">
                    {hiddenCases.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-purple-500/30 rounded-xl bg-purple-500/[0.02]">
                        <EyeOff size={28} className="mx-auto text-purple-400/40 mb-2" />
                        <p style={S.textPrimary} className="text-xs font-semibold">No hidden test cases</p>
                        <p style={S.textMuted} className="text-[11px] mt-1 mb-3">Add hidden cases to thoroughly evaluate edge cases and performance</p>
                        <button 
                          type="button" 
                          onClick={handleAddHiddenCase} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-300 bg-purple-600/80 hover:bg-purple-600 rounded-lg transition-all"
                        >
                          <Plus size={13} /> Add Hidden Case
                        </button>
                      </div>
                    ) : (
                      hiddenCases.map((item, idx) => renderTestCaseCard(item, idx, false))
                    )}
                  </div>

                  {/* Column 2 Bottom Add Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-1">
                    <button
                      type="button"
                      onClick={handleAddHiddenCase}
                      className="flex-1 py-2.5 rounded-xl border border-dashed border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus size={14} /> Add Another Hidden Case
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0 justify-center">
                      <button
                        type="button"
                        onClick={() => handleAddMultipleHiddenCases(3)}
                        className="text-xs px-2.5 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
                        title="Add 3 hidden test cases at once"
                      >
                        + 3 Cases
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddMultipleHiddenCases(5)}
                        className="text-xs px-2.5 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
                        title="Add 5 hidden test cases at once"
                      >
                        + 5 Cases
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SIDEBAR (Right Column) ── */}
      <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-6">
        
        {/* Actions Card */}
        <div style={S.card} className="p-5 shadow-sm flex flex-col gap-3">
          <Button type="submit" isLoading={isSubmitting} className="w-full justify-center text-base py-2.5">
            {submitLabel}
          </Button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              style={S.textMuted}
              className="w-full justify-center py-2 text-sm font-semibold hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Configuration Card */}
        <div style={S.card} className="shadow-sm overflow-hidden">
          <div style={S.cardHeader} className="px-5 py-4">
            <h3 style={S.textPrimary} className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider">
              <Settings size={16} className="text-blue-500" /> Configuration
            </h3>
          </div>
          <div className="p-5 space-y-5">
            <Select
              label="Question Type"
              options={QUESTION_TYPE_OPTIONS}
              error={errors.questionType?.message}
              {...register('questionType')}
            />
            <Select
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              error={errors.difficulty?.message}
              {...register('difficulty')}
            />
            <Input
              label="Marks"
              type="number"
              min={1}
              max={100}
              hint="1–100 points"
              error={errors.marks?.message}
              {...register('marks')}
            />

            {questionType === 'CODING' && (
              <>
                <div style={{ background: 'var(--border-color)' }} className="h-px w-full my-1" />
                <Select
                  label="Compiler / Language Engine"
                  options={COMPILER_OPTIONS}
                  error={errors.compiler?.message}
                  {...register('compiler')}
                />
                <Input
                  label="Time Limit"
                  type="number"
                  min={100}
                  max={10000}
                  hint="100–10000 ms"
                  error={errors.timeLimitMs?.message}
                  {...register('timeLimitMs')}
                />
                <Input
                  label="Memory Limit"
                  type="number"
                  min={16}
                  max={1024}
                  hint="16–1024 MB"
                  error={errors.memoryLimitMb?.message}
                  {...register('memoryLimitMb')}
                />
              </>
            )}
          </div>
        </div>

      </div>
    </form>
  );
};

export default AdminQuestionForm;
