import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/tenantService.
 */
export const OrganizationPage = () => (
  <PageContainer title="Organization" subtitle="Your organisation profile.">
    <EmptyState title="Organization" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default OrganizationPage;
