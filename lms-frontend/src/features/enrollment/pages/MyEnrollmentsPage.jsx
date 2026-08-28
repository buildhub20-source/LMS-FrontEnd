import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/enrollmentService.
 */
export const MyEnrollmentsPage = () => (
  <PageContainer title="My enrollments" subtitle="Courses you have joined.">
    <EmptyState
      title="My enrollments"
      description="Connect this page to the API to see live data."
    />
  </PageContainer>
);

export default MyEnrollmentsPage;
