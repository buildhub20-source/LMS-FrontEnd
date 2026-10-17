import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import CourseTable from '../components/CourseTable';
import CourseFilters from '../components/CourseFilters';
import { useCourses } from '../hooks/useCourses';
import usePagination from '../../../hooks/usePagination';
import useDebounce from '../../../hooks/useDebounce';
import { ROUTES } from '../../../constants/routes';

export const CourseListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const debouncedSearch = useDebounce(filters.search);
  const pagination = usePagination();

  const { data, isLoading, error, refetch } = useCourses({
    ...filters,
    search: debouncedSearch,
    ...pagination.queryParams,
  });

  return (
    <PageContainer
      title="Courses"
      subtitle="Create, review and publish learning content."
      actions={<Button onClick={() => navigate(ROUTES.COURSE_CREATE)}>New course</Button>}
    >
      <CourseFilters value={filters} onChange={setFilters} />
      <CourseTable rows={data?.items ?? []} isLoading={isLoading} error={error} onRetry={refetch} />
      <Pagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={data?.total ?? 0}
        totalPages={Math.max(1, Math.ceil((data?.total ?? 0) / pagination.pageSize))}
        onPageChange={pagination.goToPage}
        onPageSizeChange={pagination.changePageSize}
      />
    </PageContainer>
  );
};

export default CourseListPage;
