import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Palette, Save, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import { useToast } from '../../../components/feedback/Toast';
import tenantService from '../services/tenantService';
import { ROUTES } from '../../../constants/routes';
import { tenantSlugFromHostname } from '../../../utils/tenantHostname';
import { normalizeError } from '../../../utils/errorUtils';

const TABS = [
  { id: 'general', label: 'General', icon: <Building2 size={16} /> },
  { id: 'branding', label: 'Branding', icon: <Palette size={16} /> },
];

const PRESET_COLORS = [
  'var(--primary)',
  '#3b82f6',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#1e293b',
];

const EDITABLE_FIELDS = ['name', 'supportEmail', 'description', 'primaryColor', 'logoUrl'];

const toForm = (settings = {}) => ({
  name: settings.name ?? '',
  supportEmail: settings.supportEmail ?? '',
  description: settings.description ?? '',
  primaryColor: settings.primaryColor ?? '#10b981',
  logoUrl: settings.logoUrl ?? '',
});

const changedFields = (initial, current) =>
  EDITABLE_FIELDS.reduce((changes, field) => {
    if ((current[field] ?? '') !== (initial[field] ?? '')) changes[field] = current[field].trim();
    return changes;
  }, {});

export const OrganizationSettingsPage = () => {
  const settings = useQuery({
    queryKey: ['tenant', 'current'],
    queryFn: () => tenantService.getCurrent(),
  });

  if (settings.isLoading) return <Spinner />;
  if (settings.error) return <ErrorState error={settings.error} onRetry={settings.refetch} />;

  // Remount with fresh values whenever the saved settings change.
  return <SettingsForm key={JSON.stringify(settings.data ?? {})} initial={toForm(settings.data)} />;
};

const SettingsForm = ({ initial }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(initial);

  const changes = changedFields(initial, form);
  const hasChanges = Object.keys(changes).length > 0;

  const save = useMutation({
    mutationFn: (payload) => tenantService.updateSettings(payload),
    onSuccess: (saved) => {
      queryClient.setQueryData(['tenant', 'current'], saved);
      toast.success('Organization settings saved.');
    },
    onError: (error) => toast.error(normalizeError(error).message),
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const slug = tenantSlugFromHostname();
  const baseDomain = import.meta.env.VITE_TENANT_BASE_DOMAIN || 'localhost';

  const inputStyle = {
    width: '100%',
    padding: '9px 14px',
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
  };
  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 6,
  };
  const helpTextStyle = { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 };

  return (
    <PageContainer
      title="Organization Settings"
      subtitle="Your institute's name, contact details and branding."
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.ORGANIZATION)}
            iconLeft={<ArrowLeft size={15} />}
          >
            Overview
          </Button>
          <Button
            variant="primary"
            onClick={() => save.mutate(changes)}
            isLoading={save.isPending}
            disabled={!hasChanges || save.isPending}
            iconLeft={<Save size={15} />}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <div
        style={{
          maxWidth: 1000,
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
            to={ROUTES.ORGANIZATION}
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Organization
          </Link>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Settings</span>
        </div>

        <div
          role="tablist"
          style={{
            display: 'flex',
            gap: 6,
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: 2,
            overflowX: 'auto',
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px 8px 0 0',
                background: activeTab === t.id ? 'var(--surface-medium)' : 'transparent',
                borderBottom:
                  activeTab === t.id ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 16,
            padding: 28,
          }}
        >
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 20,
                }}
              >
                <div>
                  <label htmlFor="org-name" style={labelStyle}>
                    Organization Name
                  </label>
                  <input
                    id="org-name"
                    style={inputStyle}
                    maxLength={160}
                    value={form.name}
                    onChange={update('name')}
                  />
                  <span style={helpTextStyle}>
                    Shown on the sign-in page, dashboards and certificates.
                  </span>
                </div>

                <div>
                  <label htmlFor="org-support-email" style={labelStyle}>
                    Support Email
                  </label>
                  <input
                    id="org-support-email"
                    style={inputStyle}
                    type="email"
                    maxLength={255}
                    value={form.supportEmail}
                    onChange={update('supportEmail')}
                  />
                  <span style={helpTextStyle}>Where learners are told to send questions.</span>
                </div>
              </div>

              <div>
                <label htmlFor="org-description" style={labelStyle}>
                  Description
                </label>
                <textarea
                  id="org-description"
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  maxLength={2000}
                  value={form.description}
                  onChange={update('description')}
                />
              </div>

              <div>
                <span style={labelStyle}>Workspace Address</span>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>
                  {slug ? `${slug}.${baseDomain}` : 'Not available'}
                </p>
                <span style={helpTextStyle}>
                  Set when the workspace was created. Using your own domain is not supported yet.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <span style={labelStyle}>Primary Brand Color</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Use color ${c}`}
                      aria-pressed={form.primaryColor === c}
                      onClick={() => setForm({ ...form, primaryColor: c })}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: c,
                        border: form.primaryColor === c ? '3px solid #ffffff' : 'none',
                        boxShadow: form.primaryColor === c ? `0 0 0 2px ${c}` : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {form.primaryColor === c && <Check size={14} color="#ffffff" />}
                    </button>
                  ))}
                  <input
                    type="color"
                    aria-label="Custom brand color"
                    value={form.primaryColor}
                    onChange={update('primaryColor')}
                    style={{
                      width: 34,
                      height: 34,
                      padding: 0,
                      border: 'none',
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="org-logo-url" style={labelStyle}>
                  Logo URL
                </label>
                <input
                  id="org-logo-url"
                  style={inputStyle}
                  type="url"
                  placeholder="https://"
                  maxLength={1024}
                  value={form.logoUrl}
                  onChange={update('logoUrl')}
                />
                <span style={helpTextStyle}>
                  An https link to a PNG or SVG. Used on certificates.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default OrganizationSettingsPage;
