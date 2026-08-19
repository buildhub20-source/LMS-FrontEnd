import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import useAuth from '../features/auth/hooks/useAuth';

/**
 * Shared chrome for every authenticated area.
 * Role layouts differ only by the navigation they inject.
 */
export const AppShell = ({ navigation, title }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="u-flex" style={{ minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen}>{navigation}</Sidebar>
      <div className="u-flex-col u-grow" style={{ minWidth: 0 }}>
        <Header title={title} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
          <Avatar name={user?.fullName ?? user?.email} src={user?.avatarUrl} size="sm" />
          <Button variant="ghost" size="sm" onClick={logout}>
            Sign out
          </Button>
        </Header>
        <main className="u-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AppShell;
