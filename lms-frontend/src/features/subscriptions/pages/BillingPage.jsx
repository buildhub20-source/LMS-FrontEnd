import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/subscriptionService.
 */
export const BillingPage = () => (
  <PageContainer title="Billing" subtitle="Invoices and payment history.">
    <EmptyState title="Billing" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default BillingPage;
