import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser, selectMustChangePassword } from '../features/auth/store/authSlice';
import { ROLE_HOME_ROUTE } from '../constants/roles';
import { ROUTES } from '../constants/routes';

/** Keeps signed-in users away from login/reset pages. */
export const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const mustChangePassword = useSelector(selectMustChangePassword);

  if (isAuthenticated) {
    // Invited user that still has temp password must go straight to set-password
    if (mustChangePassword) {
      return <Navigate to={ROUTES.SET_PASSWORD} replace />;
    }
    const firstRole = Array.isArray(user?.roles) ? user.roles[0] : null;
    const home = ROLE_HOME_ROUTE[firstRole] ?? ROUTES.PROFILE;
    return <Navigate to={home} replace />;
  }

  return children ?? <Outlet />;
};

export default GuestRoute;
