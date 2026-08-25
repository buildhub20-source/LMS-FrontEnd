import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import CoursePlayer from '../components/CoursePlayer';
import courseService from '../../courses/services/courseService';

/** Full-bleed distraction-free player - intentionally without PageContainer chrome. */
export const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['learning', courseId, 'player'],
    queryFn: () => courseService.getById(courseId),
    enabled: Boolean(courseId),
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <CoursePlayer course={data} lesson={data?.currentLesson} />
    </div>
  );
};

export default CoursePlayerPage;
