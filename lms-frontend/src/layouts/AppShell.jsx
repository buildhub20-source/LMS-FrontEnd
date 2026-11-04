import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import IconSidebar from '../components/layout/Sidebar/IconSidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import useAuth from '../features/auth/hooks/useAuth';
import { ROUTES } from '../constants/routes';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import ImpersonationBanner from '../features/platform/components/ImpersonationBanner';
import BroadcastBanner from '../features/platform/components/BroadcastBanner';
import TeamsNotificationHost from '../features/notifications/components/TeamsNotificationToast';
import chatSocketService from '../features/chat/services/chatSocketService';
import chatUnreadService from '../features/chat/services/chatUnreadService';
import appConfig from '../config/appConfig';

/**
 * AppShell — Figma-inspired layout.
 *
 * Structure:
 * ┌──────────────────────────────────────────────────┐
 * │ [Icon Sidebar]  │  [Header with Tab Nav]         │
 * │   56px          │  ──────────────────────────── │
 * │   icons         │  [Main Content Area]           │
 * │   dark bg       │  Light pastel background       │
 * │                 │  ──────────────────────────── │
 * │                 │  [Footer]                      │
 * └──────────────────────────────────────────────────┘
 */

// Chat and the role pages are mounted under different layouts, so moving between
// them remounts AppShell. Keep the sidebar's open/closed choice outside the
// component (and in localStorage across reloads) so it survives that remount.
const SIDEBAR_KEY = 'lms_sidebar_expanded';
let sidebarExpandedMemory = null;

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(max-width: 1023px)').matches;

function readSidebarExpanded() {
  // On small screens the expanded sidebar is an overlay; always start closed there.
  if (isMobileViewport()) return false;
  if (sidebarExpandedMemory !== null) return sidebarExpandedMemory;
  try {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberSidebarExpanded(expanded) {
  if (isMobileViewport()) return;
  sidebarExpandedMemory = expanded;
  try {
    localStorage.setItem(SIDEBAR_KEY, String(expanded));
  } catch {
    /* storage unavailable; the in-memory value still covers this session */
  }
}

export const AppShell = ({ navigation, tabNav }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpandedState] = useState(readSidebarExpanded);
  const setSidebarExpanded = (next) => {
    setSidebarExpandedState((current) => {
      const value = typeof next === 'function' ? next(current) : next;
      rememberSidebarExpanded(value);
      return value;
    });
  };

  // Maintain active chat socket connection globally
  useEffect(() => {
    if (user) {
      chatSocketService.connect();
    }
  }, [user]);

  // Manage Browser Tab Unread Count
  useEffect(() => {
    if (!user) {
      document.title = appConfig.name;
      return;
    }

    const userId = user.id || user.userId || user.sub;
    chatUnreadService.init(userId);

    const unsub = chatUnreadService.subscribe((totalUnread) => {
      if (totalUnread > 0) {
        document.title = `(${totalUnread}) ${appConfig.name}`;
      } else {
        document.title = appConfig.name;
      }
    });

    return () => {
      unsub();
    };
  }, [user]);

  const handleSignOut = async () => {
    chatSocketService.disconnect();
    chatUnreadService.reset();
    document.title = appConfig.name;
    await logout();
    navigate(ROUTES.LOGIN, { replace: true, state: {} });
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* Slim Icon Sidebar */}
        <IconSidebar
          items={navigation}
          onLogout={handleSignOut}
          user={user}
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
        />

        {/* Main content column */}
        <div className="ml-14 flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-0">
          <ImpersonationBanner />
          <BroadcastBanner />

          <Header
            onToggleSidebar={() => setSidebarExpanded((expanded) => !expanded)}
            tabNav={tabNav}
          />

          <main
            className="flex-1 overflow-y-auto p-6 relative"
            style={{ background: 'var(--background)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="h-full flex flex-col"
              >
                <RouteErrorBoundary>
                  <Outlet />
                </RouteErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </div>
      <TeamsNotificationHost />
    </>
  );
};

export default AppShell;
