import { useNavigate, useParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import CourseForm from '../components/CourseForm';
import useCourse from '../hooks/useCourse';
import { useUpdateCourse } from '../hooks/useCourses';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';

import { useState } from 'react';
import CurriculumBuilder from '../components/CurriculumBuilder';

export const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: course, isLoading, error, refetch } = useCourse(courseId);
  const { mutateAsync, error: saveError } = useUpdateCourse(courseId);
  const [activeTab, setActiveTab] = useState('basic');

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
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'curriculum'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Curriculum
          </button>
        </nav>
      </div>

      {activeTab === 'basic' ? (
        <CourseForm
          defaultValues={course}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          error={saveError}
        />
      ) : (
        <CurriculumBuilder course={course} />
      )}
    </PageContainer>
  );
};

export default EditCoursePage;
