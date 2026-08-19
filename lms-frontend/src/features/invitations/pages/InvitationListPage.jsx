import PageContainer from '../../../components/layout/PageContainer';
import EmptyState from '../../../components/common/EmptyState';

/**
 * Scaffold page. Data wiring goes through ../hooks + ../services/invitationService.
 */
export const InvitationListPage = () => (
  <PageContainer title="Invitations" subtitle="Pending and expired invitations.">
    <EmptyState title="Invitations" description="Connect this page to the API to see live data." />
  </PageContainer>
);

export default InvitationListPage;
