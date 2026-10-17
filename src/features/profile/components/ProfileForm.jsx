import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../../../components/common/Input';
import TextArea from '../../../components/common/TextArea';
import Button from '../../../components/common/Button';
import Alert from '../../../components/feedback/Alert';
import { profileSchema } from '../validation/profileSchemas';

export const ProfileForm = ({ defaultValues, onSubmit, error = null }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(profileSchema), defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="u-flex-col u-gap-4">
      {error && <Alert tone="error">{error.message}</Alert>}
      <Input
        label="Full name"
        required
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input label="Job title" error={errors.jobTitle?.message} {...register('jobTitle')} />
      <TextArea label="Bio" rows={4} error={errors.bio?.message} {...register('bio')} />
      <Button type="submit" isLoading={isSubmitting}>
        Save changes
      </Button>
    </form>
  );
};

export default ProfileForm;
