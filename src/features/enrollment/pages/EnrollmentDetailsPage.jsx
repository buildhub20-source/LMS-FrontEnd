import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/enrollmentService.
 */
export const EnrollmentDetailsPage = () => (
  <PageContainer title="Enrollment details" subtitle="Progress and history for this enrollment.">
    <EmptyState
      title="Enrollment details"
      description="Connect this page to the API to see live data."
    />
  </PageContainer>
);

export default EnrollmentDetailsPage;
