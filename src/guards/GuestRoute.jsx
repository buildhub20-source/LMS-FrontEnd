import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/store/authSlice';
import { ROLE_HOME_ROUTE } from '../constants/roles';
import { ROUTES } from '../constants/routes';

/** Keeps signed-in users away from login/reset pages. */
export const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  if (isAuthenticated) {
    const home = ROLE_HOME_ROUTE[user?.roles?.[0]] ?? ROUTES.PROFILE;
    return <Navigate to={home} replace />;
  }

  return children ?? <Outlet />;
};

export default GuestRoute;
