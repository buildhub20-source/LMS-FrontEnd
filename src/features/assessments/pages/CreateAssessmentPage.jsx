import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/assessmentService.
 */
export const CreateAssessmentPage = () => (
  <PageContainer title="New assessment" subtitle="Build questions and scoring rules.">
    <EmptyState
      title="New assessment"
      description="Connect this page to the API to see live data."
    />
  </PageContainer>
);

export default CreateAssessmentPage;
