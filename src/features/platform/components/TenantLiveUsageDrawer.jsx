import { useQuery } from '@tanstack/react-query';
import { X, Video, Clock, TrendingUp, Users, Film, Zap, AlertTriangle } from 'lucide-react';
import platformService from '../services/platformService';
import AdminButton from '../../../components/ui/AdminButton';

const UsageBar = ({ label, used, limit, color = '#6366f1' }) => {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isNearLimit = pct >= 80;
  const isOverLimit = pct >= 100;
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: isOverLimit ? '#f87171' : isNearLimit ? '#fb923c' : 'var(--text-muted)' }}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 99,
            background: isOverLimit ? '#ef4444' : isNearLimit ? '#f97316' : color,
            transition: 'width 0.5s ease',
            boxShadow: `0 0 8px ${isOverLimit ? 'rgba(239,68,68,0.4)' : color + '60'}`,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{pct}% used</span>
        {isNearLimit && !isOverLimit && (
          <span style={{ fontSize: 10, color: '#fb923c', display: 'flex', alignItems: 'center', gap: 3 }}>
            <AlertTriangle size={10} /> Nearing limit
          </span>
        )}
        {isOverLimit && (
          <span style={{ fontSize: 10, color: '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}>
            <AlertTriangle size={10} /> Quota exceeded
          </span>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color = '#6366f1' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--surface-medium)', border: '1px solid var(--border-color)' }}>
    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}1a`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
      {sub && <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>{sub}</p>}
    </div>
  </div>
);

export const TenantLiveUsageDrawer = ({ tenant, isOpen, onClose, onConfigureClick }) => {
  const usageQuery = useQuery({
    queryKey: ['tenant-live-usage', tenant?.id],
    queryFn: () => platformService.getTenantLiveUsage(tenant?.id),
    enabled: Boolean(isOpen && tenant?.id),
    refetchInterval: isOpen ? 30000 : false,
  });

  if (!isOpen || !tenant) return null;

  const usage = usageQuery.data;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: 440, background: 'var(--surface-dark)', borderLeft: '1px solid var(--border-color)', padding: 24, display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '0 12px 32px rgba(0,0,0,0.8)', fontFamily: 'Inter, sans-serif' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={18} color="#818cf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Live Classes Usage</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                {tenant.slug} · <span style={{ color: '#818cf8' }}>{usage?.billingMonth || '—'}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {usageQuery.isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading usage data...</div>
        ) : usageQuery.isError ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>Failed to load usage data.</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Live Classes may not be enabled for this tenant.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

            {/* Quota Progress Bars */}
            <div style={{ padding: '16px', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 14 }}>
                Monthly Quota
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <UsageBar
                  label="Participant Minutes"
                  used={usage?.participantMinutesUsed ?? 0}
                  limit={usage?.monthlyLiveParticipantMinutesLimit ?? 0}
                  color="#6366f1"
                />
                {(usage?.monthlyRecordingMinutesLimit ?? 0) > 0 && (
                  <UsageBar
                    label="Recording Minutes"
                    used={usage?.recordingMinutesUsed ?? 0}
                    limit={usage?.monthlyRecordingMinutesLimit ?? 0}
                    color="#8b5cf6"
                  />
                )}
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', fontSize: 11, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={12} />
                {(usage?.remainingMinutes ?? 0).toLocaleString()} participant-minutes remaining this month
              </div>
            </div>

            {/* Stats Grid */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                Session Statistics
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard
                  icon={<Video size={16} color="#6366f1" />}
                  label="Sessions Hosted"
                  value={(usage?.sessionsHosted ?? 0).toLocaleString()}
                  color="#6366f1"
                />
                <StatCard
                  icon={<Users size={16} color="#0ea5e9" />}
                  label="Peak Concurrent"
                  value={usage?.peakConcurrentParticipants ?? 0}
                  sub="participants at once"
                  color="#0ea5e9"
                />
                <StatCard
                  icon={<Clock size={16} color="#10b981" />}
                  label="Participant Minutes"
                  value={(usage?.participantMinutesUsed ?? 0).toLocaleString()}
                  color="#10b981"
                />
                <StatCard
                  icon={<Film size={16} color="#f59e0b" />}
                  label="Recording Minutes"
                  value={(usage?.recordingMinutesUsed ?? 0).toLocaleString()}
                  color="#f59e0b"
                />
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Configure Button */}
            {onConfigureClick && (
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
                <AdminButton variant="outline" onClick={onClose} style={{ flex: 1 }}>Close</AdminButton>
                <AdminButton onClick={() => { onClose(); onConfigureClick(); }} style={{ flex: 1 }} icon={<TrendingUp size={14} />}>
                  Configure Limits
                </AdminButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantLiveUsageDrawer;
