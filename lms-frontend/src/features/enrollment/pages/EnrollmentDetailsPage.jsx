import { useParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/common/Card/Card';
import Badge from '../../../components/common/Badge/Badge';
import { useAdminEnrollment } from '../hooks/useEnrollments';
import { format } from 'date-fns';

export const EnrollmentDetailsPage = () => {
  const { enrollmentId } = useParams();
  const { data, isLoading, error } = useAdminEnrollment(enrollmentId);

  if (isLoading) return <PageContainer title="Loading..." />;
  if (error || !data) return <PageContainer title="Error" subtitle="Could not load enrollment details." />;

  const enrollment = data?.data || data;

  return (
    <PageContainer title="Enrollment Details" subtitle={`Enrollment ID: ${enrollment.id}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Student Information" className="p-4">
          <p><strong>Name:</strong> {enrollment.student?.fullName || '-'}</p>
          <p><strong>Email:</strong> {enrollment.student?.email}</p>
        </Card>
        
        <Card title="Course Information" className="p-4">
          <p><strong>Title:</strong> {enrollment.course?.title}</p>
          <p><strong>Instructor ID:</strong> {enrollment.course?.instructorId || '-'}</p>
        </Card>
        
        <Card title="Enrollment Status" className="p-4 md:col-span-2">
          <p className="mb-2">
            <strong>Status:</strong>{' '}
            <Badge variant={enrollment.status === 'ACTIVE' ? 'success' : enrollment.status === 'COMPLETED' ? 'info' : 'warning'}>
              {enrollment.status}
            </Badge>
          </p>
          <p><strong>Enrolled At:</strong> {enrollment.enrolledAt ? format(new Date(enrollment.enrolledAt), 'MMM d, yyyy HH:mm') : '-'}</p>
          <p><strong>Started At:</strong> {enrollment.startedAt ? format(new Date(enrollment.startedAt), 'MMM d, yyyy HH:mm') : '-'}</p>
          <p><strong>Completed At:</strong> {enrollment.completedAt ? format(new Date(enrollment.completedAt), 'MMM d, yyyy HH:mm') : '-'}</p>
          <p><strong>Last Accessed:</strong> {enrollment.lastAccessedAt ? format(new Date(enrollment.lastAccessedAt), 'MMM d, yyyy HH:mm') : '-'}</p>
        </Card>
      </div>
    </PageContainer>
  );
};

export default EnrollmentDetailsPage;
