import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { changePasswordSchema } from '../validation/profileSchemas';
import profileService from '../services/profileService';
import { normalizeError } from '../../../utils/errorUtils';
import { useToast } from '../../../components/feedback/Toast';

export const ChangePasswordForm = () => {
  const toast = useToast();
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      await profileService.changePassword(values);
      toast.success('Password updated');
      reset();
      setError(null);
    } catch (submitError) {
      setError(normalizeError(submitError));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="u-flex-col u-gap-4">
      {error && <Alert tone="error">{error.message}</Alert>}
      <Input
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" isLoading={isSubmitting}>
        Update password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
