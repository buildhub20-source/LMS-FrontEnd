import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Pagination from '../../../components/common/Pagination';
import CourseTable from '../components/CourseTable';
import CourseFilters from '../components/CourseFilters';
import { useCourses, useDeleteCourse } from '../hooks/useCourses';
import courseService from '../services/courseService';
import { useToast } from '../../../components/feedback/Toast';
import usePagination from '../../../hooks/usePagination';
import useDebounce from '../../../hooks/useDebounce';
import { ROUTES } from '../../../constants/routes';

export const CourseListPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(filters.search);
  const pagination = usePagination();
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMutation = useDeleteCourse();

  const { data, isLoading, error, refetch } = useCourses({
    ...filters,
    search: debouncedSearch,
    ...pagination.queryParams,
  });

  const coursesList = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.content || data.items || data.data?.content || [];
  }, [data]);

  const totalItems = useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    return data.totalElements ?? data.total ?? coursesList.length;
  }, [data, coursesList]);

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      if (courseToDelete.status === 'PUBLISHED') {
        await courseService.unpublish(courseToDelete.id);
      }
      await deleteMutation.mutateAsync(courseToDelete.id);
      toast.success('Course deleted successfully.');
      setCourseToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete course.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer
      title="Courses"
      subtitle="Create, review and publish learning content."
      actions={
        <Button onClick={() => navigate(ROUTES.COURSE_CREATE)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          <span>New Course</span>
        </Button>
      }
    >
      <CourseFilters value={filters} onChange={setFilters} />
      <CourseTable
        rows={coursesList}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onDelete={setCourseToDelete}
      />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={totalItems}
        totalPages={Math.max(1, Math.ceil(totalItems / pagination.pageSize))}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.changePageSize}
      />

      <ConfirmDialog
        isOpen={Boolean(courseToDelete)}
        onCancel={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        message={
          courseToDelete?.status === 'PUBLISHED'
            ? `"${courseToDelete?.title}" is currently PUBLISHED. To safely delete it, it will be unpublished first and then permanently removed. Are you sure?`
            : `Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </PageContainer>
  );
};

export default CourseListPage;

