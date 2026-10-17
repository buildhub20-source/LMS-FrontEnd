import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import CourseForm from '../components/CourseForm';
import { useCreateCourse } from '../hooks/useCourses';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { mutateAsync, error } = useCreateCourse();

  const handleSubmit = async (values) => {
    const course = await mutateAsync(values);
    toast.success('Course created');
    navigate(ROUTES.COURSE_DETAILS(course.id));
  };

  return (
    <PageContainer
      title="New course"
      breadcrumbs={[{ label: 'Courses', to: ROUTES.COURSES }, { label: 'New course' }]}
    >
      <CourseForm onSubmit={handleSubmit} onCancel={() => navigate(ROUTES.COURSES)} error={error} />
    </PageContainer>
  );
};

export default CreateCoursePage;
