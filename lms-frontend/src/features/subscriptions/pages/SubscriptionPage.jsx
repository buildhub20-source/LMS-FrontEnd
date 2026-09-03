import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/subscriptionService.
 */
export const SubscriptionPage = () => (
  <PageContainer title="Subscription" subtitle="Your current plan and usage.">
    <EmptyState title="Subscription" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default SubscriptionPage;
