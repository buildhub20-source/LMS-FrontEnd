import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/common/Card';
import ChangePasswordForm from '../components/ChangePasswordForm';

export const SecurityPage = () => (
  <PageContainer title="Security" subtitle="Keep your account safe.">
    <Card title="Change password">
      <ChangePasswordForm />
    </Card>
  </PageContainer>
);

export default SecurityPage;
