import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  MailPlus,
  ClipboardList,
  Building2,
  CreditCard,
  KeyRound,
  BookOpen,
  FileText,
  GraduationCap,
  CalendarRange,
  Presentation,
  ScrollText,
  FolderDown,
  Trophy,
  MessageSquare,
  Video,
  Settings,
  BarChart3,
} from 'lucide-react';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import AppShell from './AppShell';
import TopTabNav from '../components/layout/TopTabNav/TopTabNav';
import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

/* ── Sidebar icon items (slim sidebar) ──────────────── */
const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    to: ROUTES.ADMIN_ANALYTICS,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Users',
    to: ROUTES.USERS,
    group: 'People',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Learners',
    to: ROUTES.STUDENTS,
    group: 'People',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    label: 'Instructors',
    to: ROUTES.INSTRUCTORS,
    group: 'People',
    icon: <Presentation className="h-5 w-5" />,
  },
  {
    label: 'Courses',
    to: ROUTES.ADMIN_COURSES,
    group: 'Learning',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: 'Live Classes',
    to: ROUTES.ADMIN_LIVE_CLASSES,
    group: 'Learning',
    icon: <Video className="h-5 w-5" />,
  },
  {
    label: 'Assessments',
    to: ROUTES.ADMIN_ASSESSMENTS,
    group: 'Learning',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: 'Enrollments',
    to: ROUTES.ENROLLMENTS,
    group: 'Learning',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    label: 'Batches',
    to: ROUTES.BATCHES,
    group: 'Learning',
    icon: <CalendarRange className="h-5 w-5" />,
  },
  {
    label: 'Campus Toolkit',
    to: ROUTES.CAMPUS_RESOURCES,
    group: 'Learning',
    icon: <FolderDown className="h-5 w-5" />,
  },
  {
    label: 'Chat',
    to: ROUTES.CHAT,
    group: 'Communication',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: 'Roles',
    to: ROUTES.ROLES,
    group: 'Settings',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    label: 'Invitations',
    to: ROUTES.INVITATIONS,
    group: 'Settings',
    icon: <MailPlus className="h-5 w-5" />,
  },
  {
    label: 'Organization',
    to: ROUTES.ORGANIZATION,
    group: 'Settings',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    label: 'Gamification',
    to: ROUTES.ADMIN_GAMIFICATION,
    group: 'Settings',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    label: 'Audit Logs',
    to: ROUTES.AUDIT_LOGS,
    group: 'Settings',
    icon: <ScrollText className="h-5 w-5" />,
  },
];

/* ── Top tab nav items ──────────────────────────────── */
const TOP_TABS = [
  { label: 'Dashboard', to: ROUTES.ADMIN_ANALYTICS, icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Courses', to: ROUTES.ADMIN_COURSES, icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Students', to: ROUTES.STUDENTS, icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'Assessments', to: ROUTES.ADMIN_ASSESSMENTS, icon: <FileText className="h-4 w-4" /> },
  { label: 'Settings', to: ROUTES.ORGANIZATION, icon: <Settings className="h-4 w-4" /> },
];

export const AdminLayout = () => (
  <RouteErrorBoundary>
    <AppShell
      navigation={SIDEBAR_ITEMS}
      tabNav={<TopTabNav tabs={TOP_TABS} />}
    />
  </RouteErrorBoundary>
);

export default AdminLayout;
