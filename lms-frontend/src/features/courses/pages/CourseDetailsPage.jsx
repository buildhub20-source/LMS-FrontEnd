import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/common/Card';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import CourseStatusBadge from '../components/CourseStatusBadge';
import CourseThumbnail from '../components/CourseThumbnail';
import useCourse from '../hooks/useCourse';
import { ROUTES } from '../../../constants/routes';
import { formatDuration } from '../../../utils/dateUtils';

export const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { data: course, isLoading, error, refetch } = useCourse(courseId);

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer
      title={course.title}
      subtitle={course.summary}
      breadcrumbs={[{ label: 'Courses', to: ROUTES.COURSES }, { label: course.title }]}
      actions={<Link to={ROUTES.COURSE_EDIT(courseId)}>Edit course</Link>}
    >
      <div className="u-flex u-gap-4 u-wrap">
        <div style={{ maxWidth: 420 }}>
          <CourseThumbnail src={course.thumbnailUrl} alt={course.title} />
        </div>
        <Card title="Overview" className="u-grow">
          <p>{course.description}</p>
          <p className="u-text-sm u-text-muted u-mt-4">
            <CourseStatusBadge status={course.status} /> &middot; {course.level} &middot;{' '}
            {formatDuration((course.durationMinutes ?? 0) * 60)} &middot;{' '}
            {course.enrolledCount ?? 0} enrolled
          </p>
        </Card>
      </div>
    </PageContainer>
  );
};

export default CourseDetailsPage;
