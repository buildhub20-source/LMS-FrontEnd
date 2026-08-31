import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';

const ITEMS = [
  { label: 'My courses', to: ROUTES.MY_COURSES },
  { label: 'My enrollments', to: ROUTES.MY_ENROLLMENTS },
  { label: 'Assessments', to: ROUTES.STUDENT_ASSESSMENTS },
  { label: 'Progress', to: ROUTES.STUDENT_PROGRESS, group: 'Achievements' },
  { label: 'Certificates', to: ROUTES.CERTIFICATES, group: 'Achievements' },
];

export const StudentNavigation = () => <MainNavigation items={ITEMS} />;

export default StudentNavigation;
