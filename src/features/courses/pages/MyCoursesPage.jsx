import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';
import CourseCard from '../components/CourseCard';
import { useMyCourses } from '../hooks/useCourses';
import { ROUTES } from '../../../constants/routes';

export const MyCoursesPage = () => {
  const { data, isLoading, error, refetch } = useMyCourses();
  const courses = data?.items ?? [];

  return (
    <PageContainer title="My courses" subtitle="Everything you are enrolled in.">
      {isLoading && <Spinner />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {!isLoading && !error && courses.length === 0 && (
        <EmptyState
          title="No courses yet"
          description="Once you are enrolled, your courses appear here."
        />
      )}
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-4)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} to={ROUTES.LEARNING(course.id)} />
        ))}
      </div>
    </PageContainer>
  );
};

export default MyCoursesPage;
