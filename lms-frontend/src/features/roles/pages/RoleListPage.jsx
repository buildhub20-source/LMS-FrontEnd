import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/roleService.
 */
export const RoleListPage = () => (
  <PageContainer title="Roles" subtitle="Define what each role can do.">
    <EmptyState title="Roles" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default RoleListPage;
