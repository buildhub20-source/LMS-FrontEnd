import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/tenantService.
 */
export const OrganizationSettingsPage = () => (
  <PageContainer title="Organization settings" subtitle="Branding, domains and defaults.">
    <EmptyState
      title="Organization settings"
      description="Connect this page to the API to see live data."
    />
  </PageContainer>
);

export default OrganizationSettingsPage;
