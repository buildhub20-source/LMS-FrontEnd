import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Trophy,
  CalendarDays,
  StickyNote,
  MessageSquare,
  Video,
  Bell,
  Home,
  Settings,
} from 'lucide-react';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import AppShell from './AppShell';
import TopTabNav from '../components/layout/TopTabNav/TopTabNav';
import { ROUTES } from '../constants/routes';

/* ── Sidebar icon items ─────────────────────────────── */
const SIDEBAR_ITEMS = [
  { label: 'Dashboard', to: ROUTES.STUDENT_PROGRESS, icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Courses', to: ROUTES.MY_COURSES, group: 'Learning', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Live Classes', to: ROUTES.STUDENT_LIVE_CLASSES, group: 'Learning', icon: <Video className="h-5 w-5" /> },
  { label: 'Assessments', to: ROUTES.STUDENT_ASSESSMENTS, group: 'Learning', icon: <FileText className="h-5 w-5" /> },
  { label: 'Calendar', to: ROUTES.CALENDAR, group: 'Learning', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Notes', to: ROUTES.NOTES_BOOKMARKS, group: 'Learning', icon: <StickyNote className="h-5 w-5" /> },
  { label: 'Achievements', to: ROUTES.GAMIFICATION, group: 'Achievements', icon: <Trophy className="h-5 w-5" /> },
  { label: 'Certificates', to: ROUTES.CERTIFICATES, group: 'Achievements', icon: <Award className="h-5 w-5" /> },
  { label: 'Chat', to: ROUTES.CHAT, group: 'Communication', icon: <MessageSquare className="h-5 w-5" /> },
];

/* ── Top tab nav ────────────────────────────────────── */
const TOP_TABS = [
  { label: 'Home', to: ROUTES.STUDENT_PROGRESS, icon: <Home className="h-4 w-4" /> },
  { label: 'My Courses', to: ROUTES.MY_COURSES, icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Assessments', to: ROUTES.STUDENT_ASSESSMENTS, icon: <FileText className="h-4 w-4" /> },
  { label: 'Calendar', to: ROUTES.CALENDAR, icon: <CalendarDays className="h-4 w-4" /> },
  { label: 'Certificates', to: ROUTES.CERTIFICATES, icon: <Award className="h-4 w-4" /> },
];

export const StudentLayout = () => (
  <RouteErrorBoundary>
    <AppShell
      navigation={SIDEBAR_ITEMS}
      tabNav={<TopTabNav tabs={TOP_TABS} />}
    />
  </RouteErrorBoundary>
);

export default StudentLayout;
