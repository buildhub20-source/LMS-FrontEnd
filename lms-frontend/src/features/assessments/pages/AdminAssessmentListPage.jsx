import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import AssessmentTable from '../components/AssessmentTable';
import AssessmentFilters from '../components/AssessmentFilters';
import {
  useAdminAssessments,
  usePublishAssessment,
  useUnpublishAssessment,
  useCloseAssessment,
  useArchiveAssessment,
  useDeleteAdminAssessment,
} from '../hooks/useAdminAssessments';
import usePagination from '../../../hooks/usePagination';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';

export const AdminAssessmentListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState({});
  const pagination = usePagination();

  const { data, isLoading, error, refetch } = useAdminAssessments({
    ...filters,
    ...pagination.queryParams,
  });

  const publish   = usePublishAssessment();
  const unpublish = useUnpublishAssessment();
  const closeA    = useCloseAssessment();
  const archive   = useArchiveAssessment();
  const deleteA   = useDeleteAdminAssessment();

  const handleAction = async (type, assessment) => {
    switch (type) {
      case 'view':
        navigate(ROUTES.ADMIN_ASSESSMENT_DETAILS(assessment.id));
        break;
      case 'edit':
        navigate(ROUTES.ADMIN_ASSESSMENT_EDIT(assessment.id));
        break;
      case 'questions':
        navigate(ROUTES.ADMIN_ASSESSMENT_DETAILS(assessment.id));
        break;
      case 'publish':
        try {
          await publish.mutateAsync(assessment.id);
          toast.success(`"${assessment.title}" published!`);
        } catch (e) {
          toast.error(e.message || 'Failed to publish');
        }
        break;
      case 'unpublish':
        try {
          await unpublish.mutateAsync(assessment.id);
          toast.success(`"${assessment.title}" moved back to Draft`);
        } catch (e) {
          toast.error(e.message || 'Failed to unpublish');
        }
        break;
      case 'close':
        if (!window.confirm(`Close "${assessment.title}"? Students will no longer be able to start new attempts.`)) return;
        try {
          await closeA.mutateAsync(assessment.id);
          toast.success(`"${assessment.title}" closed`);
        } catch (e) {
          toast.error(e.message || 'Failed to close');
        }
        break;
      case 'archive':
        if (!window.confirm(`Archive "${assessment.title}"? It will be hidden from all listings.`)) return;
        try {
          await archive.mutateAsync(assessment.id);
          toast.success(`"${assessment.title}" archived`);
        } catch (e) {
          toast.error(e.message || 'Failed to archive');
        }
        break;
      case 'delete':
        if (!window.confirm(`Permanently delete "${assessment.title}"? This cannot be undone.`)) return;
        try {
          await deleteA.mutateAsync(assessment.id);
          toast.success(`"${assessment.title}" deleted`);
        } catch (e) {
          toast.error(e.message || 'Failed to delete');
        }
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer
      title="Assessments"
      subtitle="Create, manage and publish coding assessments."
      actions={
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate(ROUTES.ADMIN_ASSESSMENT_CREATE)}>
          New assessment
        </Button>
      }
    >
      <AssessmentFilters value={filters} onChange={setFilters} />
      <AssessmentTable
        rows={data?.content ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onAction={handleAction}
      />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={data?.totalElements ?? 0}
        totalPages={data?.totalPages ?? Math.max(1, Math.ceil((data?.totalElements ?? 0) / pagination.pageSize))}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.changePageSize}
      />
    </PageContainer>
  );
};

export default AdminAssessmentListPage;
