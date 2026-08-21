import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Avatar from '../components/common/Avatar';
import useAuth from '../features/auth/hooks/useAuth';

/**
 * Shared chrome for every authenticated area.
 * Role layouts differ only by the navigation they inject.
 *
 * Layout: fixed sidebar (w-64 desktop) + flex column main (header / scrollable content / footer)
 */
export const AppShell = ({ navigation, title }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const userCard = (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <Avatar name={user?.fullName ?? user?.email ?? ''} src={user?.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user?.fullName ?? 'Administrator'}
        </p>
        <p className="truncate text-xs text-slate-500">{user?.email}</p>
      </div>
      <button
        onClick={logout}
        className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — fixed on desktop, slides in on mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        footer={userCard}
      >
        {navigation}
      </Sidebar>

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        >
          <Avatar name={user?.fullName ?? user?.email ?? ''} src={user?.avatarUrl} size="sm" />
        </Header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppShell;
