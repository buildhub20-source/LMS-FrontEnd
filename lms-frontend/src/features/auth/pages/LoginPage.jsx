import { useNavigate } from 'react-router-dom';
import { SignInPage } from '../../../components/ui/sign-in';
import { ROUTES } from '../../../constants/routes';
import { isPlatformHostname, tenantSlugFromHostname } from '../../../utils/tenantHostname';
import useLogin from '../hooks/useLogin';

export const LoginPage = () => {
  const { submit, error, isSubmitting, clearError } = useLogin();
  const navigate = useNavigate();
  const tenantSlug = tenantSlugFromHostname();
  const platformLogin = isPlatformHostname();

  const handleSignIn = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await submit({
      email: formData.get('email'),
      password: formData.get('password'),
      tenantSlug: formData.get('tenantSlug'),
      rememberMe: formData.has('rememberMe'),
    });
  };

  return (
    <SignInPage
      onSignIn={handleSignIn}
      onResetPassword={() => navigate(ROUTES.FORGOT_PASSWORD)}
      error={error}
      errorMessage={error?.message}
      onDismissError={clearError}
      isSubmitting={isSubmitting}
      description={platformLogin
        ? 'Sign in to manage tenant databases and their lifecycle.'
        : tenantSlug
          ? `Sign in to the ${tenantSlug} learning workspace.`
          : 'Open a tenant workspace URL to sign in.'}
      showTenantSlug={false}
    />
  );
};

export default LoginPage;
