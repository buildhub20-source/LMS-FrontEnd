import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { resetPasswordSchema } from '../validation/authSchemas';
import authService from '../services/authService';
import { normalizeError } from '../../../utils/errorUtils';
import { ROUTES } from '../../../constants/routes';

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: searchParams.get('token') ?? '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      await authService.resetPassword(values);
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (submitError) {
      setError(normalizeError(submitError));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="u-flex-col u-gap-4">
      {error && <Alert tone="error">{error.message}</Alert>}
      <input type="hidden" {...register('token')} />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
