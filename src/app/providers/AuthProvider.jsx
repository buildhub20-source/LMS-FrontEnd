import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadSession, sessionExpired, selectAuthStatus } from '../../features/auth/store/authSlice';
import Spinner from '../../components/common/Spinner';

/**
 * Bootstraps the session once on mount and listens for the global
 * `auth:session-expired` event raised by the axios response interceptor.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  useEffect(() => {
    const handler = () => dispatch(sessionExpired());
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, [dispatch]);

  if (status === 'idle' || status === 'loading') {
    return <Spinner fullPage label="Loading your workspace" />;
  }

  return children;
};

export default AuthProvider;
