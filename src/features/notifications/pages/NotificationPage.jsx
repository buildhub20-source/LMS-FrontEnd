import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import ErrorState from '../../../components/common/ErrorState';
import NotificationList from '../components/NotificationList';
import notificationService from '../services/notificationService';
import { QUERY_KEYS } from '../../../constants/appConstants';

export const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => notificationService.list(),
  });

  const markAllRead = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }),
  });

  const markRead = useMutation({
    mutationFn: (notification) => notificationService.markRead(notification.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS }),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <PageContainer
      title="Notifications"
      actions={
        <Button
          variant="secondary"
          onClick={() => markAllRead.mutate()}
          isLoading={markAllRead.isPending}
        >
          Mark all read
        </Button>
      }
    >
      <NotificationList
        notifications={data?.items ?? []}
        isLoading={isLoading}
        onSelect={markRead.mutate}
      />
    </PageContainer>
  );
};

export default NotificationPage;
