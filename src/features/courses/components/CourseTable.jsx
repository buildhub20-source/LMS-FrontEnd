import { Link } from 'react-router-dom';
import DataTable from '../../../components/common/DataTable';
import { ROUTES } from '../../../constants/routes';
import { formatDate, formatDuration } from '../../../utils/dateUtils';
import CourseStatusBadge from './CourseStatusBadge';

const columns = [
  {
    key: 'title',
    header: 'Course',
    sortable: true,
    render: (course) => <Link to={ROUTES.COURSE_DETAILS(course.id)}>{course.title}</Link>,
  },
  { key: 'level', header: 'Level' },
  {
    key: 'status',
    header: 'Status',
    render: (course) => <CourseStatusBadge status={course.status} />,
  },
  { key: 'enrolledCount', header: 'Enrolled', sortable: true },
  {
    key: 'durationMinutes',
    header: 'Duration',
    render: (course) => formatDuration((course.durationMinutes ?? 0) * 60),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    sortable: true,
    render: (course) => formatDate(course.updatedAt),
  },
];

export const CourseTable = (props) => (
  <DataTable
    columns={columns}
    emptyTitle="No courses yet"
    emptyDescription="Create your first course to get started."
    {...props}
  />
);

export default CourseTable;
