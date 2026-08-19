import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Pagination from '../../../components/common/Pagination';
import UserTable from '../components/UserTable';
import { useUsers } from '../hooks/useUsers';
import usePagination from '../../../hooks/usePagination';
import useDebounce from '../../../hooks/useDebounce';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import { ROUTES } from '../../../constants/routes';

export const UserListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const pagination = usePagination();

  const { data, isLoading, error, refetch } = useUsers({
    search: debouncedSearch,
    ...pagination.queryParams,
  });

  return (
    <PageContainer
      title="Users"
      subtitle="Manage everyone in your organisation."
      actions={
        <PermissionGuard required={[PERMISSIONS.USER_WRITE]} fallback={null}>
          <Button onClick={() => navigate(ROUTES.USER_CREATE)}>Add user</Button>
        </PermissionGuard>
      }
    >
      <Input
        label="Search"
        placeholder="Name or email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="u-mb-4"
      />
      <UserTable rows={data?.items ?? []} isLoading={isLoading} error={error} onRetry={refetch} />
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

export default UserListPage;
