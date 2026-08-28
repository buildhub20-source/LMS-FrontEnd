import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import CourseForm from '../components/CourseForm';
import { useCreateCourse } from '../hooks/useCourses';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { mutateAsync, error } = useCreateCourse();

  const isAdmin = location.pathname.startsWith('/admin');
  const coursesRoute = isAdmin ? ROUTES.ADMIN_COURSES : ROUTES.COURSES;
  const detailsRoute = (id) => (isAdmin ? ROUTES.ADMIN_COURSE_DETAILS(id) : ROUTES.COURSE_DETAILS(id));

  const handleSubmit = async (values) => {
    const course = await mutateAsync(values);
    toast.success('Course created');
    navigate(detailsRoute(course.id));
  };

  return (
    <PageContainer
      title="New course"
      breadcrumbs={[{ label: 'Courses', to: coursesRoute }, { label: 'New course' }]}
    >
      <CourseForm onSubmit={handleSubmit} onCancel={() => navigate(coursesRoute)} error={error} />
    </PageContainer>
  );
};

export default CreateCoursePage;
