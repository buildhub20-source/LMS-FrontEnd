import {
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardList,
  Users,
  Award,
  Database,
  FolderDown,
  Megaphone,
  MessageSquare,
  Video,
  Settings,
  BarChart3,
} from 'lucide-react';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import AppShell from './AppShell';
import TopTabNav from '../components/layout/TopTabNav/TopTabNav';
import { ROUTES } from '../constants/routes';

/* ── Sidebar icon items ─────────────────────────────── */
const SIDEBAR_ITEMS = [
  { label: 'Dashboard', to: ROUTES.INSTRUCTOR_ANALYTICS, icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Courses', to: ROUTES.COURSES, group: 'Teaching', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Live Classes', to: ROUTES.INSTRUCTOR_LIVE_CLASSES, group: 'Teaching', icon: <Video className="h-5 w-5" /> },
  { label: 'Cohorts', to: ROUTES.INSTRUCTOR_BATCHES, group: 'Teaching', icon: <Users className="h-5 w-5" /> },
  { label: 'Assessments', to: ROUTES.ASSESSMENTS, group: 'Teaching', icon: <FileText className="h-5 w-5" /> },
  { label: 'Question Bank', to: ROUTES.INSTRUCTOR_QUESTION_BANK, group: 'Teaching', icon: <Database className="h-5 w-5" /> },
  { label: 'Certificates', to: ROUTES.INSTRUCTOR_CERTIFICATES, group: 'Teaching', icon: <Award className="h-5 w-5" /> },
  { label: 'Study Toolkits', to: ROUTES.INSTRUCTOR_RESOURCES, group: 'Teaching', icon: <FolderDown className="h-5 w-5" /> },
  { label: 'Announcements', to: ROUTES.INSTRUCTOR_ANNOUNCEMENTS, group: 'Communication', icon: <Megaphone className="h-5 w-5" /> },
  { label: 'Chat', to: ROUTES.CHAT, group: 'Communication', icon: <MessageSquare className="h-5 w-5" /> },
];

/* ── Top tab nav ────────────────────────────────────── */
const TOP_TABS = [
  { label: 'Dashboard', to: ROUTES.INSTRUCTOR_ANALYTICS, icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Courses', to: ROUTES.COURSES, icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Assessments', to: ROUTES.ASSESSMENTS, icon: <FileText className="h-4 w-4" /> },
  { label: 'Live Classes', to: ROUTES.INSTRUCTOR_LIVE_CLASSES, icon: <Video className="h-4 w-4" /> },
  { label: 'Settings', to: ROUTES.PROFILE, icon: <Settings className="h-4 w-4" /> },
];

export const InstructorLayout = () => (
  <RouteErrorBoundary>
    <AppShell
      navigation={SIDEBAR_ITEMS}
      tabNav={<TopTabNav tabs={TOP_TABS} />}
    />
  </RouteErrorBoundary>
);

export default InstructorLayout;
