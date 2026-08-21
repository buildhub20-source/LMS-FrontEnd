import AdminNavigation from '../components/navigation/AdminNavigation';
import AppShell from './AppShell';

export const AdminLayout = () => (
  <AppShell title="Administration" navigation={<AdminNavigation />} />
);

export default AdminLayout;
