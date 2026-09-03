import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/assessmentService.
 */
export const AssessmentListPage = () => (
  <PageContainer title="Assessments" subtitle="Quizzes and exams you own.">
    <EmptyState title="Assessments" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default AssessmentListPage;
