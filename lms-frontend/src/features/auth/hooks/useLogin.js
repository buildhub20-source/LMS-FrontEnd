import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../store/authSlice';
import { ROLE_HOME_ROUTE } from '../../../constants/roles';
import { ROUTES } from '../../../constants/routes';
import storage from '../../../services/storage/localStorage';
import { STORAGE_KEYS } from '../../../constants/appConstants';
import platformAuthStorage from '../../platform/services/platformAuthStorage';
import platformService from '../../platform/services/platformService';
import { isPlatformHostname, tenantSlugFromHostname } from '../../../utils/tenantHostname';

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
      const { tenantSlug: _tenantSlug, ...loginCredentials } = credentials;
      const slug = tenantSlugFromHostname();

      if (isPlatformHostname()) {
        storage.remove(STORAGE_KEYS.TENANT);
        try {
          const response = await platformService.login(loginCredentials);
          platformAuthStorage.setToken(response.accessToken);
          setIsSubmitting(false);
          navigate(ROUTES.PLATFORM_TENANTS, { replace: true });
          return true;
        } catch (requestError) {
          setIsSubmitting(false);
          setError({ message: requestError?.response?.data?.message
            ?? 'Global administrator sign-in failed. Select a tenant slug for a tenant account.' });
          return false;
        }
      }

      if (!slug) {
        setIsSubmitting(false);
        setError({ message: 'Open your tenant workspace URL to sign in, for example lms-integration-test.localhost:3000.' });
        return false;
      }

      platformAuthStorage.clear();
      storage.set(STORAGE_KEYS.TENANT, { slug });

      const result = await dispatch(login(loginCredentials));
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
