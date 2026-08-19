import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Checkbox from '../../../components/common/Checkbox';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { loginSchema } from '../validation/authSchemas';
import useLogin from '../hooks/useLogin';
import { ROUTES } from '../../../constants/routes';

export const LoginForm = () => {
  const { submit, error, isSubmitting } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="u-flex-col u-gap-4">
      {error && <Alert tone="error">{error.message}</Alert>}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <div className="u-flex u-items-center u-justify-between">
        <Checkbox label="Remember me" {...register('rememberMe')} />
        <Link to={ROUTES.FORGOT_PASSWORD} className="u-text-sm">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
};

export default LoginForm;
