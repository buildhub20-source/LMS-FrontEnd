import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import CoursePlayer from '../components/CoursePlayer';
import learningService from '../services/learningService';

export const LearningPage = () => {
  const { courseId } = useParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['learning', courseId],
    queryFn: () => learningService.getCourse(courseId),
    enabled: Boolean(courseId),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer title={data?.title}>
      <CoursePlayer course={data} lesson={data?.currentLesson} />
    </PageContainer>
  );
};

export default LearningPage;
