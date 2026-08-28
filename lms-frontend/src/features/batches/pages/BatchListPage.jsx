import { useState } from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import DataTable from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Alert from '../../../components/feedback/Alert';
import { useToast } from '../../../components/feedback/Toast';
import { useCourses } from '../../courses/hooks/useCourses';
import { useInstructors } from '../../instructors/hooks/useInstructors';
import { BATCH_STATUS_OPTIONS, BATCH_STATUS_TONE } from '../../../constants/batchConstants';
import { ROUTES } from '../../../constants/routes';
import BatchForm from '../components/BatchForm';
import { useBatches, useCreateBatch, useDeleteBatch, useUpdateBatch } from '../hooks/useBatches';
import {
  toBatchFormValues,
  toBatchPayload,
  toUpdateBatchPayload,
} from '../validation/batchSchemas';

const PAGE_SIZE = 20;

export const BatchListPage = () => {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  // null = closed, {} = creating, {id,...} = editing.
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useBatches({ search, status, page, size: PAGE_SIZE });

  // Picker sources, loaded once here and shared by both dialogs. A batch is
  // scheduled rarely enough that pulling a page of each beats adding a
  // dedicated lookup endpoint.
  const { data: coursePage } = useCourses({ size: 100 });
  const { data: instructorPage } = useInstructors({ size: 100 });

  const create = useCreateBatch();
  const update = useUpdateBatch();
  const remove = useDeleteBatch();

  const onFilterChange = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const closeModal = () => {
    setEditing(null);
    create.reset();
    update.reset();
  };

  const onSubmit = async (values) => {
    if (editing?.id) {
      const saved = await update.mutateAsync({ id: editing.id, ...toUpdateBatchPayload(values) });
      toast.success(`Batch ${saved.code} updated`);
    } else {
      const saved = await create.mutateAsync(toBatchPayload(values));
      toast.success(`Batch ${saved.code} scheduled`);
    }
    closeModal();
  };

  const onDelete = async () => {
    await remove.mutateAsync(deleting.id);
    toast.success(`Batch ${deleting.code} deleted`);
    setDeleting(null);
  };

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'courseTitle', header: 'Course', render: (row) => row.courseTitle || '—' },
    { key: 'instructorName', header: 'Instructor', render: (row) => row.instructorName || '—' },
    {
      key: 'dates',
      header: 'Runs',
      render: (row) => (row.endDate ? `${row.startDate} → ${row.endDate}` : `${row.startDate} →`),
    },
    { key: 'schedule', header: 'Schedule', render: (row) => row.schedule || '—' },
    {
      key: 'enrolled',
      header: 'Enrolled',
      render: (row) =>
        row.capacity ? `${row.enrolledCount} / ${row.capacity}` : row.enrolledCount,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge tone={BATCH_STATUS_TONE[row.status] ?? 'neutral'}>{row.status}</Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <span className="u-flex u-gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            // The API refuses this too; disabling explains why before the click.
            disabled={row.enrolledCount > 0}
            title={
              row.enrolledCount > 0
                ? `${row.enrolledCount} learner(s) still enrolled — cancel the batch instead`
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

  return (
    <PageContainer
      title="Batches"
      subtitle="Dated cohorts learners are enrolled into."
      breadcrumbs={[{ label: 'Dashboard', to: ROUTES.ROOT }, { label: 'Batches' }]}
      actions={<Button onClick={() => setEditing({})}>Schedule Batch</Button>}
    >
      {remove.error && <Alert tone="error">{remove.error.message}</Alert>}

      <div className="u-flex u-gap-3 u-wrap u-mb-4">
        <Input
          label="Search"
          placeholder="Batch code or name"
          value={search}
          onChange={(event) => onFilterChange(setSearch)(event.target.value)}
        />
        <Select
          label="Status"
          placeholder="Any status"
          options={BATCH_STATUS_OPTIONS}
          value={status}
          onChange={(event) => onFilterChange(setStatus)(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageData?.content ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="No batches yet"
        emptyDescription="Schedule a batch before admitting learners into it."
        emptyAction={<Button onClick={() => setEditing({})}>Schedule Batch</Button>}
      />

      {/* Pagination is 1-based; PageResponse.page is 0-based (Spring Pageable). */}
      {pageData && (
        <Pagination
          page={pageData.page + 1}
          pageSize={pageData.size}
          totalItems={pageData.totalElements}
          totalPages={pageData.totalPages}
          onPageChange={(next) => setPage(next - 1)}
        />
      )}

      <Modal
        isOpen={editing !== null}
        onClose={closeModal}
        title={editing?.id ? `Edit ${editing.code}` : 'Schedule a batch'}
      >
        <BatchForm
          isEdit={Boolean(editing?.id)}
          defaultValues={editing?.id ? toBatchFormValues(editing) : undefined}
          courses={coursePage?.content ?? []}
          instructors={instructorPage?.content ?? []}
          onSubmit={onSubmit}
          onCancel={closeModal}
          submitLabel={editing?.id ? 'Save changes' : 'Schedule batch'}
          error={create.error || update.error}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        title="Delete this batch?"
        message={`${deleting?.code} will be removed. This cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  );
};

export default BatchListPage;
