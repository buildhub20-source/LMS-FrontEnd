import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';
import { PERMISSIONS } from '../../../constants/permissions';

const ITEMS = [
  { label: 'Dashboard', to: ROUTES.INSTRUCTOR_ANALYTICS, permission: PERMISSIONS.ANALYTICS_READ },
  { label: 'Courses', to: ROUTES.COURSES, permission: PERMISSIONS.COURSE_VIEW, group: 'Teaching' },
  {
    label: 'Assessments',
    to: ROUTES.ASSESSMENTS,
    permission: PERMISSIONS.ASSESSMENT_READ,
    group: 'Teaching',
  },
  {
    label: 'Enrollments',
    to: ROUTES.ENROLLMENTS,
    permission: PERMISSIONS.ENROLLMENT_READ,
    group: 'Teaching',
  },
];

export const InstructorNavigation = () => <MainNavigation items={ITEMS} />;

export default InstructorNavigation;
