import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import LessonContent from '../components/LessonContent';
import learningService from '../services/learningService';

export const LessonPage = () => {
  const { courseId, lessonId } = useParams();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['learning', courseId, 'lesson', lessonId],
    queryFn: () => learningService.getLesson(courseId, lessonId),
    enabled: Boolean(courseId && lessonId),
  });

  const saveProgress = useMutation({
    mutationFn: (payload) => learningService.saveProgress(courseId, { lessonId, ...payload }),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer>
      <LessonContent lesson={data} onProgress={saveProgress.mutate} />
    </PageContainer>
  );
};

export default LessonPage;
