import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../features/auth/store/authSlice';
import { ROUTES } from '../constants/routes';
import Spinner from '../components/common/Spinner';

/** Blocks unauthenticated access and remembers where the user was headed. */
export const ProtectedRoute = ({ children }) => {
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') return <Spinner fullPage />;

  if (status !== 'authenticated') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
};

export default ProtectedRoute;
