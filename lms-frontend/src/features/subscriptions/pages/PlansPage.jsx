import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/subscriptionService.
 */
export const PlansPage = () => (
  <PageContainer title="Plans" subtitle="Compare available plans.">
    <EmptyState title="Plans" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default PlansPage;
