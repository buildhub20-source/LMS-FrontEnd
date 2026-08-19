import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import ResultSummary from '../components/ResultSummary';
import assessmentService from '../services/assessmentService';

export const AssessmentResultPage = () => {
  const { attemptId } = useParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assessment-result', attemptId],
    queryFn: () => assessmentService.getResult(attemptId),
    enabled: Boolean(attemptId),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer title="Assessment result">
      <ResultSummary result={data} />
    </PageContainer>
  );
};

export default AssessmentResultPage;
