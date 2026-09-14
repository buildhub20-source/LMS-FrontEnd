import { FolderDown, BookOpen, FileText, ClipboardList, LayoutDashboard, Megaphone, Database } from 'lucide-react';
import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';
import { PERMISSIONS } from '../../../constants/permissions';

const ITEMS = [
  {
    label: 'Dashboard',
    to: ROUTES.INSTRUCTOR_ANALYTICS,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Courses',
    to: ROUTES.COURSES,
    permission: PERMISSIONS.COURSE_VIEW,
    group: 'Teaching',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: 'Assessments',
    to: ROUTES.ASSESSMENTS,
    permission: PERMISSIONS.ASSESSMENT_VIEW,
    group: 'Teaching',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Question Bank',
    to: ROUTES.INSTRUCTOR_QUESTION_BANK,
    group: 'Teaching',
    icon: <Database className="h-5 w-5" />,
  },
  {
    label: 'Enrollments',
    to: ROUTES.ENROLLMENTS,
    permission: PERMISSIONS.ENROLLMENT_VIEW,
    group: 'Teaching',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Study Toolkits',
    to: ROUTES.INSTRUCTOR_RESOURCES,
    group: 'Teaching',
    icon: <FolderDown className="h-5 w-5" />,
  },
  {
    label: 'Announcements',
    to: ROUTES.INSTRUCTOR_ANNOUNCEMENTS,
    group: 'Communication',
    icon: <Megaphone className="h-5 w-5" />,
  },
];

export const InstructorNavigation = () => <MainNavigation items={ITEMS} />;

export default InstructorNavigation;
