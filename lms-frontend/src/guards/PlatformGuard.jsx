import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import platformAuthStorage from '../features/platform/services/platformAuthStorage';
import { isPlatformHostname } from '../utils/tenantHostname';

/**
 * Keeps the global control plane separate from tenant sessions.  A tenant JWT
 * is never sufficient to render platform tenant-management routes.
 */
export const PlatformGuard = () => {
  const hasPlatformSession = Boolean(platformAuthStorage.getToken());
  return hasPlatformSession && isPlatformHostname()
    ? <Outlet />
    : <Navigate to={ROUTES.LOGIN} replace />;
};

export default PlatformGuard;
