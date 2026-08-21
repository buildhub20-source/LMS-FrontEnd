import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../store/authSlice';
import { ROLE_HOME_ROUTE } from '../../../constants/roles';
import { ROUTES } from '../../../constants/routes';

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (credentials) => {
      setIsSubmitting(true);
      setError(null);
      const result = await dispatch(login(credentials));
      setIsSubmitting(false);

      if (login.rejected.match(result)) {
        setError(result.payload);
        return false;
      }

      const primaryRole = result.payload?.roles?.[0];
      const fallback = ROLE_HOME_ROUTE[primaryRole] ?? ROUTES.PROFILE;
      navigate(location.state?.from?.pathname ?? fallback, { replace: true });
      return true;
    },
    [dispatch, navigate, location],
  );

  return { submit, error, isSubmitting };
};

export default useLogin;
