import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/certificateService.
 */
export const CertificateListPage = () => (
  <PageContainer title="Certificates" subtitle="Certificates you have earned.">
    <EmptyState title="Certificates" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default CertificateListPage;
