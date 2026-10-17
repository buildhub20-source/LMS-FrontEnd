import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/enrollmentService.
 */
export const EnrollmentListPage = () => (
  <PageContainer title="Enrollments" subtitle="Every enrollment across the organisation.">
    <EmptyState title="Enrollments" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default EnrollmentListPage;
