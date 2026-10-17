import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import IconSidebar from '../components/layout/Sidebar/IconSidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import useAuth from '../features/auth/hooks/useAuth';
import { ThemeProvider } from '../context/ThemeContext';
import { ROUTES } from '../constants/routes';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';
import ImpersonationBanner from '../features/platform/components/ImpersonationBanner';
import BroadcastBanner from '../features/platform/components/BroadcastBanner';
import TeamsNotificationHost from '../features/notifications/components/TeamsNotificationToast';
import chatSocketService from '../features/chat/services/chatSocketService';
import chatUnreadService from '../features/chat/services/chatUnreadService';

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
export const AppShell = ({ navigation, tabNav, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Maintain active chat socket connection globally
  useEffect(() => {
    if (user) {
      chatSocketService.connect();
    }
  }, [user]);

  // Manage Browser Tab Unread Count
  useEffect(() => {
    if (!user) {
      document.title = 'LMS';
      return;
    }

    const userId = user.id || user.userId || user.sub;
    chatUnreadService.init(userId);

    const unsub = chatUnreadService.subscribe((totalUnread) => {
      if (totalUnread > 0) {
        document.title = `(${totalUnread}) LMS`;
      } else {
        document.title = 'LMS';
      }
    });

    return () => {
      unsub();
    };
  }, [user]);

  const handleSignOut = async () => {
    chatSocketService.disconnect();
    chatUnreadService.reset();
    document.title = 'LMS';
    await logout();
    navigate(ROUTES.LOGIN, { replace: true, state: {} });
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
        {/* Slim Icon Sidebar */}
        <IconSidebar
          items={navigation}
          onLogout={handleSignOut}
          user={user}
        />

        {/* Main content column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <ImpersonationBanner />
          <BroadcastBanner />

          <Header
            onToggleSidebar={() => {}}
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
    </ThemeProvider>
  );
};

export default AppShell;
