import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, HelpCircle } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../constants/routes';

/**
 * Plans are not sold in the app yet, so this page lists none rather than
 * showing prices and limits that do not exist.
 */
export const PlansPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="Subscription Plans"
      subtitle="Your organisation's plan and how to change it."
      actions={
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.SUBSCRIPTION)}
          iconLeft={<ArrowLeft size={15} />}
        >
          My Subscription
        </Button>
      }
    >
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          <Link
            to={ROUTES.SUBSCRIPTION}
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Subscription
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Plans</span>
        </div>

        <div
          role="status"
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: 24,
            borderRadius: 16,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
          }}
        >
          <HelpCircle
            size={22}
            style={{ color: 'var(--primary)', flexShrink: 0 }}
            aria-hidden="true"
          />
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Plan changes are handled by your platform administrator
            </h2>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 14,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              Online plan selection and payment are not available in the app yet. To change your
              plan, the number of learners, or your billing details, contact your platform
              administrator.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default PlansPage;
