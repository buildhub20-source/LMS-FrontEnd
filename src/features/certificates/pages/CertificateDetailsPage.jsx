import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/certificateService.
 */
export const CertificateDetailsPage = () => (
  <PageContainer title="Certificate" subtitle="Verify and download this certificate.">
    <EmptyState title="Certificate" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default CertificateDetailsPage;
