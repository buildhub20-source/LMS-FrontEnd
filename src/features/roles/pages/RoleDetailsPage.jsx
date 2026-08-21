import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/roleService.
 */
export const RoleDetailsPage = () => (
  <PageContainer title="Role details" subtitle="Permissions granted by this role.">
    <EmptyState title="Role details" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default RoleDetailsPage;
