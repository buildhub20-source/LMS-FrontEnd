import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Select from '../../../components/common/Select';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { courseSchema } from '../validation/courseSchemas';
import { COURSE_LEVEL_OPTIONS, COURSE_STATUS } from '../constants/courseConstants';

const EMPTY_COURSE = {
  title: '',
  summary: '',
  description: '',
  level: '',
  status: COURSE_STATUS.DRAFT,
  categoryId: '',
  durationMinutes: 60,
  tags: [],
};

export const CourseForm = ({
  defaultValues = EMPTY_COURSE,
  categories = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save course',
  error = null,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(courseSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="u-flex-col u-gap-4">
      {error && <Alert tone="error">{error.message}</Alert>}

      <Input label="Title" required error={errors.title?.message} {...register('title')} />
      <Input
        label="Summary"
        hint="Shown on course cards"
        error={errors.summary?.message}
        {...register('summary')}
      />
      <TextArea
        label="Description"
        rows={6}
        required
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="u-flex u-gap-3 u-wrap">
        <Select
          label="Level"
          required
          options={COURSE_LEVEL_OPTIONS}
          error={errors.level?.message}
          {...register('level')}
        />
        <Select
          label="Category"
          required
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
          error={errors.categoryId?.message}
          {...register('categoryId')}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          required
          error={errors.durationMinutes?.message}
          {...register('durationMinutes')}
        />
      </div>

      <div className="u-flex u-gap-2">
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

export default CourseForm;
