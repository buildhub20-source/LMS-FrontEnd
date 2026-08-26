import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import DataTable from '../../../components/common/DataTable';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import { useInstructors } from '../hooks/useInstructors';
import {
  EMPLOYMENT_TYPE_LABEL,
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_TONE,
} from '../constants/instructorConstants';
import { ROUTES } from '../../../constants/routes';

const PAGE_SIZE = 20;

export const InstructorListPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [page, setPage] = useState(0);

  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useInstructors({ search, employmentType, page, size: PAGE_SIZE });

  // Any filter change invalidates the current page number.
  const onFilterChange = (setter) => (value) => {
    setter(value);
    setPage(0);
  };

  const accountBadge = (row) => {
    if (row.locked) return <Badge tone="danger">Suspended</Badge>;
    if (!row.active) return <Badge tone="neutral">Pending</Badge>;
    return <Badge tone="success">Active</Badge>;
  };

  const columns = [
    { key: 'employeeCode', header: 'Emp. Code' },
    { key: 'fullName', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (row) => row.specialization || '—',
    },
    {
      key: 'employmentType',
      header: 'Engagement',
      render: (row) => (
        <Badge tone={EMPLOYMENT_TYPE_TONE[row.employmentType] ?? 'neutral'}>
          {EMPLOYMENT_TYPE_LABEL[row.employmentType] ?? row.employmentType}
        </Badge>
      ),
    },
    {
      key: 'yearsOfExperience',
      header: 'Experience',
      render: (row) => (row.yearsOfExperience != null ? `${row.yearsOfExperience} yrs` : '—'),
    },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
    { key: 'active', header: 'Account', render: accountBadge },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(event) => {
            // The row itself opens details, so the button must not do both.
            event.stopPropagation();
            navigate(ROUTES.INSTRUCTOR_EDIT(row.id));
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="Instructors"
      subtitle="Everyone who teaches at the centre."
      breadcrumbs={[{ label: 'Dashboard', to: ROUTES.ROOT }, { label: 'Instructors' }]}
      actions={
        <Button onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE)}>Add New Instructor</Button>
      }
    >
      <div className="u-flex u-gap-3 u-wrap u-mb-4">
        <Input
          label="Search"
          placeholder="Name, email, employee code or specialization"
          value={search}
          onChange={(event) => onFilterChange(setSearch)(event.target.value)}
        />
        <Select
          label="Engagement"
          placeholder="All types"
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={employmentType}
          onChange={(event) => onFilterChange(setEmploymentType)(event.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={pageData?.content ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onRowClick={(row) => navigate(ROUTES.INSTRUCTOR_DETAILS(row.id))}
        emptyTitle="No instructors yet"
        emptyDescription="Onboard your first instructor to see them here."
        emptyAction={
          <Button onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE)}>Add New Instructor</Button>
        }
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
    </PageContainer>
  );
};

export default InstructorListPage;
