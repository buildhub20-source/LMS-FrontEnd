import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Award,
  Bell,
} from 'lucide-react';
import MainNavigation from '../MainNavigation';
import { ROUTES } from '../../../constants/routes';

/**
 * Student sidebar navigation:
 *   • Icons on every item
 *   • Grouped sections (Learning, Achievements)
 *   • Cleanly connected to backend DB endpoints
 */
const ITEMS = [
  {
    label: 'Dashboard',
    to: ROUTES.STUDENT_PROGRESS,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'My Courses',
    to: ROUTES.MY_COURSES,
    group: 'Learning',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: 'My Enrollments',
    to: ROUTES.MY_ENROLLMENTS,
    group: 'Learning',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Assessments',
    to: ROUTES.STUDENT_ASSESSMENTS,
    group: 'Learning',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Certificates',
    to: ROUTES.CERTIFICATES,
    group: 'Achievements',
    icon: <Award className="h-5 w-5" />,
  },
  {
    label: 'Notifications',
    to: ROUTES.NOTIFICATIONS,
    group: 'Achievements',
    icon: <Bell className="h-5 w-5" />,
  },
];

export const StudentNavigation = () => <MainNavigation items={ITEMS} />;

export default StudentNavigation;
