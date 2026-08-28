import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageContainer from '../../../components/layout/PageContainer';
import DataTable from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Alert from '../../../components/feedback/Alert';
import { useToast } from '../../../components/feedback/Toast';
import {
  useCreateStudentCategory,
  useDeleteStudentCategory,
  useStudentCategories,
  useUpdateStudentCategory,
} from '../hooks/useStudents';
import { ROUTES } from '../../../constants/routes';

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(50, 'Category name must not exceed 50 characters'),
  description: z
    .string()
    .trim()
    .max(255, 'Description must not exceed 255 characters')
    .optional()
    .or(z.literal('')),
  sortOrder: z
    .union([z.coerce.number().int().min(0, 'Sort order cannot be negative'), z.literal('')])
    .optional(),
});

const EMPTY = { name: '', description: '', sortOrder: '' };

export const StudentCategoryPage = () => {
  const toast = useToast();

  const { data: categories, isLoading, error, refetch } = useStudentCategories();
  const create = useCreateStudentCategory();
  const update = useUpdateStudentCategory();
  const remove = useDeleteStudentCategory();

  // null = closed, {} = creating, {id,...} = editing.
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(categorySchema), defaultValues: EMPTY });

  const open = (category) => {
    setEditing(category ?? {});
    reset(
      category
        ? {
            name: category.name,
            description: category.description ?? '',
            sortOrder: category.sortOrder ?? '',
          }
        : EMPTY,
    );
    create.reset();
    update.reset();
  };

  const close = () => {
    setEditing(null);
    reset(EMPTY);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      sortOrder: values.sortOrder === '' ? null : values.sortOrder,
    };

    if (editing?.id) {
      await update.mutateAsync({ id: editing.id, ...payload });
      toast.success(`${payload.name} updated`);
    } else {
      await create.mutateAsync(payload);
      toast.success(`${payload.name} added`);
    }
    close();
  };

  const onDelete = async () => {
    await remove.mutateAsync(deleting.id);
    toast.success(`${deleting.name} deleted`);
    setDeleting(null);
  };

  const columns = [
    { key: 'name', header: 'Category' },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    { key: 'sortOrder', header: 'Order' },
    {
      key: 'learnerCount',
      header: 'Learners',
      // The API refuses to delete a category in use, so this is the number that
      // explains why the delete button is disabled.
      render: (row) => row.learnerCount,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <span className="u-flex u-gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={row.learnerCount > 0}
            title={
              row.learnerCount > 0
                ? `${row.learnerCount} learner(s) still use this category`
                : undefined
            }
            onClick={() => setDeleting(row)}
          >
            Delete
          </Button>
        </span>
      ),
    },
  ];

  const submitError = create.error || update.error;

  return (
    <PageContainer
      title="Admission Categories"
      subtitle="Editable reference data for the learner intake form."
      breadcrumbs={[
        { label: 'Dashboard', to: ROUTES.ROOT },
        { label: 'Learners', to: ROUTES.STUDENTS },
        { label: 'Categories' },
      ]}
      actions={<Button onClick={() => open(null)}>Add Category</Button>}
    >
      {remove.error && <Alert tone="error">{remove.error.message}</Alert>}

      <DataTable
        columns={columns}
        rows={categories ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No categories yet"
        emptyDescription="Add one so the intake form has something to offer."
        emptyAction={<Button onClick={() => open(null)}>Add Category</Button>}
      />

      <Modal
        isOpen={editing !== null}
        onClose={close}
        title={editing?.id ? 'Edit category' : 'Add category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="u-flex-col u-gap-3">
          {submitError && <Alert tone="error">{submitError.message}</Alert>}

          <Input
            label="Name"
            required
            placeholder="e.g. General"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description"
            placeholder="Shown to admin staff only"
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            label="Sort Order"
            type="number"
            min="0"
            placeholder="Controls the dropdown order"
            error={errors.sortOrder?.message}
            {...register('sortOrder')}
          />

          <div className="u-flex u-gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editing?.id ? 'Save changes' : 'Add category'}
            </Button>
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete this category?"
        message={`${deleting?.name} will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  );
};

export default StudentCategoryPage;
