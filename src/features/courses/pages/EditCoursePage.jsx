import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import CourseForm from '../components/CourseForm';
import useCourse from '../hooks/useCourse';
import { useUpdateCourse } from '../hooks/useCourses';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';

export const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: course, isLoading, error, refetch } = useCourse(courseId);
  const { mutateAsync, error: saveError } = useUpdateCourse(courseId);

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const handleSubmit = async (values) => {
    await mutateAsync(values);
    toast.success('Course updated');
    navigate(ROUTES.COURSE_DETAILS(courseId));
  };

  return (
    <PageContainer
      title={`Edit: ${course.title}`}
      breadcrumbs={[
        { label: 'Courses', to: ROUTES.COURSES },
        { label: course.title, to: ROUTES.COURSE_DETAILS(courseId) },
        { label: 'Edit' },
      ]}
    >
      <CourseForm
        defaultValues={course}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        error={saveError}
      />
    </PageContainer>
  );
};

export default EditCoursePage;
