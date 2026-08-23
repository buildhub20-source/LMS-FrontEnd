import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Avatar from '../components/common/Avatar';
import useAuth from '../features/auth/hooks/useAuth';
import { ThemeProvider } from '../context/ThemeContext';

/**
 * Shared chrome for every authenticated area.
 * Role layouts differ only by the navigation they inject.
 *
 * Layout: fixed sidebar (w-64 desktop) + flex column main (header / scrollable content / footer)
 */
export const AppShell = ({ navigation, title }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Theme is handled globally by ThemeContext and main.jsx

  const userCard = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: 'var(--surface-medium)',
      border: '1px solid var(--border-color)',
    }}>
      <Avatar name={user?.fullName ?? user?.email ?? ''} src={user?.avatarUrl} size="sm" />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.fullName ?? 'Administrator'}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
      </div>
      <button
        onClick={logout}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <ThemeProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Sidebar — fixed on desktop, slides in on mobile */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          footer={userCard}
        >
          {navigation}
        </Sidebar>

        {/* Main content column */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
          <Header
            title={title}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
          >
            <Avatar name={user?.fullName ?? user?.email ?? ''} src={user?.avatarUrl} size="sm" />
          </Header>

          <main style={{ flex: 1, overflowY: 'auto', padding: '24px', position: 'relative', background: 'var(--bg)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ minHeight: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AppShell;
