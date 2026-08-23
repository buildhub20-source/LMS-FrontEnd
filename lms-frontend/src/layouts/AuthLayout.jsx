import { Outlet, useLocation } from 'react-router-dom';
import appConfig from '../config/appConfig';
import { ROUTES } from '../constants/routes';

const styles = {
  page: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-5)' },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-md)',
    padding: 'var(--space-6)',
  },
};

export const AuthLayout = () => {
  const location = useLocation();

  // These pages have their own full-screen layout
  if (location.pathname === ROUTES.LOGIN) return <Outlet />;
  if (location.pathname.startsWith('/auth/accept-invitation')) return <Outlet />;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h2 className="u-mb-4">{appConfig.name}</h2>
        <Outlet />
      </div>
    </main>
  );
};

export default AuthLayout;
