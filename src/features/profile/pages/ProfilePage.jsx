import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/common/Card';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import ProfileForm from '../components/ProfileForm';
import ProfileAvatar from '../components/ProfileAvatar';
import profileService from '../services/profileService';
import { QUERY_KEYS } from '../../../constants/appConstants';
import { useToast } from '../../../components/feedback/Toast';

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: profileService.get,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });

  const save = useMutation({
    mutationFn: profileService.update,
    onSuccess: () => {
      toast.success('Profile updated');
      invalidate();
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: profileService.uploadAvatar,
    onSuccess: invalidate,
  });

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer title="Profile" subtitle="How you appear to other people.">
      <Card>
        <ProfileAvatar user={data} onUpload={uploadAvatar.mutate} />
        <div className="u-mt-4">
          <ProfileForm defaultValues={data} onSubmit={save.mutateAsync} error={save.error} />
        </div>
      </Card>
    </PageContainer>
  );
};

export default ProfilePage;
