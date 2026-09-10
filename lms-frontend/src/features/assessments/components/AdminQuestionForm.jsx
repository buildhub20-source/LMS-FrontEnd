import { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Code2, Zap, Plus, Trash2, Eye, EyeOff, Settings, CheckCircle2, ListFilter, HelpCircle } from 'lucide-react';
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
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col gap-2 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
          <input
            className="w-full bg-transparent text-2xl font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none border-none p-0 focus:ring-0"
            placeholder="Question Title (e.g., Two Sum)..."
            {...register('title')}
          />
          {errors.title && <span className="text-sm text-red-500 font-medium">{errors.title.message}</span>}
        </div>

        {/* Problem Statement / Prompt Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#1f1f1f]/50">
            <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
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
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#1f1f1f]/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <CheckCircle2 size={18} className="text-emerald-500" /> Answer Options
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Click the letter badge to toggle whether an option is the correct answer.
                </p>
              </div>
              <button
                type="button"
                onClick={() => appendOption({ ...EMPTY_OPTION })}
                className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/30"
              >
                <Plus size={15} /> Add Option
              </button>
            </div>

            <div className="p-6 space-y-4 bg-gray-50/30 dark:bg-transparent">
              {errors.options?.message && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium">
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
                    className={`relative rounded-xl border p-4 transition-all shadow-sm ${
                      isCorrect
                        ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-emerald-500/5'
                        : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#1f1f1f]'
                    }`}
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
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0 mt-1"
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
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#1f1f1f]/50 flex justify-between items-center">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Zap size={18} className="text-yellow-500" /> Test Cases
              </h3>
              <button
                type="button"
                onClick={() => append({ ...EMPTY_TC })}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Plus size={15} /> Add Case
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-gray-50/30 dark:bg-transparent">
              {errors.testCases?.message && (
                <span className="text-sm font-medium text-red-500 block mb-2">{errors.testCases.message}</span>
              )}
              
              {fields.map((field, index) => {
                const isSample = watch(`testCases.${index}.sample`);
                return (
                  <div key={field.id} className="relative bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-700/80 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow group/tc">
                    
                    {/* Test Case Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          Test Case {index + 1}
                        </span>
                        {isSample && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
                            Sample
                          </span>
                        )}
                      </div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/tc:opacity-100 focus:opacity-100"
                          title="Remove test case"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Test Case I/O */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextArea
                        label="Input Data"
                        rows={4}
                        placeholder="Leave blank if no stdin input"
                        error={errors.testCases?.[index]?.inputData?.message}
                        {...register(`testCases.${index}.inputData`)}
                      />
                      <TextArea
                        label="Expected Output"
                        rows={4}
                        placeholder="Exact expected stdout output"
                        error={errors.testCases?.[index]?.expectedOutput?.message}
                        {...register(`testCases.${index}.expectedOutput`)}
                      />
                    </div>

                    {/* Settings Row */}
                    <div className="flex flex-row flex-wrap items-center gap-4 mt-5 p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-[#1a1a1a]/50">
                      <label className="group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-transform group-hover:scale-110 cursor-pointer" {...register(`testCases.${index}.sample`)} />
                        <Eye size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Visible to student</span>
                      </label>
                      
                      <label className="group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 transition-transform group-hover:scale-110 cursor-pointer" {...register(`testCases.${index}.hidden`)} />
                        <EyeOff size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">Hidden (graded only)</span>
                      </label>
                      
                      <div className="flex items-center gap-3 ml-auto px-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</span>
                        <div className="w-24">
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
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── SIDEBAR (Right Column) ── */}
      <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-6">
        
        {/* Actions Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col gap-3">
          <Button type="submit" isLoading={isSubmitting} className="w-full justify-center text-base py-2.5">
            {submitLabel}
          </Button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="w-full justify-center py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Configuration Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#1f1f1f]/50">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200 uppercase tracking-wider">
              <Settings size={16} className="text-gray-500" /> Configuration
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
                <div className="h-px bg-gray-100 dark:bg-gray-800/80 w-full my-1" />
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
