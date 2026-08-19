import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import Button from '../../../components/common/Button';
import QuestionCard from '../components/QuestionCard';
import AssessmentTimer from '../components/AssessmentTimer';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';

export const AssessmentPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const {
    data: attempt,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['assessment-attempt', assessmentId],
    queryFn: () => assessmentService.startAttempt(assessmentId),
    enabled: Boolean(assessmentId),
    staleTime: Infinity,
  });

  const submit = useMutation({
    mutationFn: () => assessmentService.submitAttempt(attempt.id, answers),
    onSuccess: () => navigate(ROUTES.ASSESSMENT_RESULT(attempt.id)),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer
      title={attempt.title}
      actions={
        attempt.endsAt && <AssessmentTimer endsAt={attempt.endsAt} onExpire={submit.mutate} />
      }
    >
      <div className="u-flex-col u-gap-4">
        {attempt.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id]}
            onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
          />
        ))}
        <Button onClick={() => submit.mutate()} isLoading={submit.isPending}>
          Submit answers
        </Button>
      </div>
    </PageContainer>
  );
};

export default AssessmentPage;
