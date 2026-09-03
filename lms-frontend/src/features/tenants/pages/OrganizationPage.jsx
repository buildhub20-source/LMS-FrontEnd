import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/common/Card';
import ErrorState from '../../../components/common/ErrorState';
import { useToast } from '../../../components/feedback/Toast';
import OrganizationForm from '../components/OrganizationForm';
import OrganizationBranding from '../components/OrganizationBranding';
import tenantService from '../services/tenantService';

export const OrganizationPage = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: tenantService.getCurrent,
  });
  const update = useMutation({
    mutationFn: tenantService.updateSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(['organization-settings'], settings);
      success('Organization settings saved.');
    },
    onError: (requestError) => showError(requestError?.message ?? 'Unable to save organization settings.'),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const save = (changes) => update.mutate({ ...data, ...changes });
  return (
    <PageContainer title="Organization" subtitle="Manage your organization profile and visible brand.">
      {isLoading ? <p className="u-text-muted">Loading organization settings…</p> : (
        <div className="u-grid u-gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          <Card title="Organization profile">
            <OrganizationForm defaultValues={data} onSubmit={save} isSubmitting={update.isPending} />
          </Card>
          <OrganizationBranding defaultValues={data} onSubmit={save} />
        </div>
      )}
    </PageContainer>
  );
};

export default OrganizationPage;
