import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sliders, X, Video } from 'lucide-react';
import platformService from '../services/platformService';
import AdminButton from '../../../components/ui/AdminButton';
import AdminInput from '../../../components/ui/AdminInput';

const ToggleRow = ({ checked, description, label, onChange }) => (
  <label
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 12px',
      borderRadius: 8,
      background: 'var(--surface-medium)',
      border: checked
        ? '1px solid color-mix(in srgb, var(--primary) 40%, transparent)'
        : '1px solid var(--border-color)',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-medium)')}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{
        marginTop: 3,
        width: 16,
        height: 16,
        cursor: 'pointer',
        accentColor: 'var(--primary)',
      }}
    />
    <div style={{ minWidth: 0, flex: 1 }}>
      <span
        style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
        {description}
      </span>
    </div>
  </label>
);

export const TenantConfigDrawer = ({ tenant, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    maxUsers: 500,
    maxCourses: 50,
    maxStorageGb: 20,
    aiFeaturesEnabled: true,
    advancedAnalyticsEnabled: true,
    customCertificatesEnabled: true,
    codeEvaluatorEnabled: true,
    liveProctoringEnabled: false,
    chatFileRetentionDays: 30,
    // Live Classes
    liveClassesEnabled: false,
    liveSessionProvider: 'LIVEKIT',
    maxLiveParticipants: 50,
    monthlyLiveParticipantMinutes: 1000,
    maxLiveSessionDurationMinutes: 120,
    maxConcurrentLiveSessions: 3,
    recordingEnabled: false,
    monthlyRecordingMinutes: 500,
    attendanceEnabled: true,
    liveChatEnabled: true,
    screenShareEnabled: true,
    aiTranscriptEnabled: false,
    aiSummaryEnabled: false,
  });
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  const configQuery = useQuery({
    queryKey: ['tenant-config', tenant?.id],
    queryFn: () => platformService.getTenantConfig(tenant?.id),
    enabled: Boolean(isOpen && tenant?.id),
  });

  useEffect(() => {
    if (configQuery.data) {
      const d = configQuery.data;
      // The query response is external state that initializes this controlled form.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        maxUsers: d.maxUsers ?? 500,
        maxCourses: d.maxCourses ?? 50,
        maxStorageGb: d.maxStorageGb ?? 20,
        aiFeaturesEnabled: d.aiFeaturesEnabled ?? true,
        advancedAnalyticsEnabled: d.advancedAnalyticsEnabled ?? true,
        customCertificatesEnabled: d.customCertificatesEnabled ?? true,
        codeEvaluatorEnabled: d.codeEvaluatorEnabled ?? true,
        liveProctoringEnabled: d.liveProctoringEnabled ?? false,
        chatFileRetentionDays: d.chatFileRetentionDays ?? 30,
        liveClassesEnabled: d.liveClassesEnabled ?? false,
        liveSessionProvider: d.liveSessionProvider ?? 'LIVEKIT',
        maxLiveParticipants: d.maxLiveParticipants ?? 50,
        monthlyLiveParticipantMinutes: d.monthlyLiveParticipantMinutes ?? 1000,
        maxLiveSessionDurationMinutes: d.maxLiveSessionDurationMinutes ?? 120,
        maxConcurrentLiveSessions: d.maxConcurrentLiveSessions ?? 3,
        recordingEnabled: d.recordingEnabled ?? false,
        monthlyRecordingMinutes: d.monthlyRecordingMinutes ?? 500,
        attendanceEnabled: d.attendanceEnabled ?? true,
        liveChatEnabled: d.liveChatEnabled ?? true,
        screenShareEnabled: d.screenShareEnabled ?? true,
        aiTranscriptEnabled: d.aiTranscriptEnabled ?? false,
        aiSummaryEnabled: d.aiSummaryEnabled ?? false,
      });
    }
  }, [configQuery.data]);

  useEffect(() => {
    // A reopened drawer must not display a result from a previous workspace.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setFeedback({ error: '', success: '' });
  }, [isOpen, tenant?.id]);

  const updateMutation = useMutation({
    mutationFn: (payload) => platformService.updateTenantConfig(tenant.id, payload),
    onSuccess: () => {
      setFeedback({ error: '', success: 'Configuration saved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['tenant-config', tenant.id] });
    },
    onError: (err) => {
      setFeedback({
        error: (err?.response?.data?.message ?? err?.message) || 'Failed to update configuration.',
        success: '',
      });
    },
  });

  if (!isOpen || !tenant) return null;

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });
    updateMutation.mutate({
      maxUsers: Number(formData.maxUsers),
      maxCourses: Number(formData.maxCourses),
      maxStorageGb: Number(formData.maxStorageGb),
      aiFeaturesEnabled: formData.aiFeaturesEnabled,
      advancedAnalyticsEnabled: formData.advancedAnalyticsEnabled,
      customCertificatesEnabled: formData.customCertificatesEnabled,
      codeEvaluatorEnabled: formData.codeEvaluatorEnabled,
      liveProctoringEnabled: formData.liveProctoringEnabled,
      chatFileRetentionDays: Number(formData.chatFileRetentionDays || 30),
      liveClassesEnabled: formData.liveClassesEnabled,
      liveSessionProvider: formData.liveSessionProvider,
      maxLiveParticipants: Number(formData.maxLiveParticipants),
      monthlyLiveParticipantMinutes: Number(formData.monthlyLiveParticipantMinutes),
      maxLiveSessionDurationMinutes: Number(formData.maxLiveSessionDurationMinutes),
      maxConcurrentLiveSessions: Number(formData.maxConcurrentLiveSessions),
      recordingEnabled: false,
      monthlyRecordingMinutes: Number(formData.monthlyRecordingMinutes),
      attendanceEnabled: formData.attendanceEnabled,
      liveChatEnabled: formData.liveChatEnabled,
      screenShareEnabled: formData.screenShareEnabled,
      aiTranscriptEnabled: formData.aiTranscriptEnabled,
      aiSummaryEnabled: formData.aiSummaryEnabled,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          background: 'var(--surface-dark)',
          borderLeft: '1px solid var(--border-color)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '0 12px 32px rgba(0,0,0,0.8)',
          fontFamily: 'Inter, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--border-color)',
            marginBottom: 20,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--surface-medium)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3
                style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}
              >
                Tenant Configuration
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Workspace:{' '}
                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  {tenant.slug}
                </span>
              </p>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {configQuery.isLoading ? (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
            }}
          >
            Loading configuration...
          </div>
        ) : configQuery.isError ? (
          <div role="alert" style={{ color: '#f87171', fontSize: 13 }}>
            Could not load this workspace configuration. Please close and reopen the panel to try
            again.
          </div>
        ) : (
          <form
            id="tenant-config-form"
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}
          >
            {/* Resource Quotas */}
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                Resource Quotas
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AdminInput
                  label="Max Users Allowed"
                  type="number"
                  min="1"
                  value={formData.maxUsers}
                  onChange={(e) => set('maxUsers', e.target.value)}
                />
                <AdminInput
                  label="Max Courses Allowed"
                  type="number"
                  min="1"
                  value={formData.maxCourses}
                  onChange={(e) => set('maxCourses', e.target.value)}
                />
                <AdminInput
                  label="Storage Capacity (GB)"
                  type="number"
                  min="1"
                  value={formData.maxStorageGb}
                  onChange={(e) => set('maxStorageGb', e.target.value)}
                />
                <AdminInput
                  label="Chat File Retention (Days)"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.chatFileRetentionDays}
                  onChange={(e) => set('chatFileRetentionDays', e.target.value)}
                  helperText="Attachments older than this will be permanently purged from Cloudflare R2 (default: 30 days)."
                />
              </div>
            </div>

            {/* Feature Flags */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                Feature Flags
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  {
                    id: 'aiFeaturesEnabled',
                    label: 'AI Course & Assessment Generator',
                    desc: 'GenAI automated questions and curriculum helpers',
                  },
                  {
                    id: 'advancedAnalyticsEnabled',
                    label: 'Advanced Analytics Dashboard',
                    desc: 'Detailed engagement & cohorts performance telemetry',
                  },
                  {
                    id: 'customCertificatesEnabled',
                    label: 'Custom Certificate Templates',
                    desc: 'Tenant branding & PDF certificate generation',
                  },
                  {
                    id: 'codeEvaluatorEnabled',
                    label: 'Online Code Evaluator / Compiler',
                    desc: 'Multi-language testbench execution',
                  },
                  {
                    id: 'liveProctoringEnabled',
                    label: 'AI Live Proctoring Suite',
                    desc: 'Webcam snapshot tracking and browser lockdown',
                  },
                ].map((f) => (
                  <ToggleRow
                    key={f.id}
                    checked={Boolean(formData[f.id])}
                    description={f.desc}
                    label={f.label}
                    onChange={(checked) => set(f.id, checked)}
                  />
                ))}
              </div>
            </div>

            {/* ── Live Classes ── */}
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--primary) 30%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Video size={14} style={{ color: 'var(--link)' }} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Live Classes
                </span>
                {formData.liveClassesEnabled && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                      color: 'var(--link)',
                      border: '1px solid color-mix(in srgb, var(--primary) 35%, transparent)',
                    }}
                  >
                    ENABLED
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ToggleRow
                  checked={formData.liveClassesEnabled}
                  label="Enable Live Classes"
                  description="Allow instructors to schedule live classes"
                  onChange={(checked) => set('liveClassesEnabled', checked)}
                />

                {formData.liveClassesEnabled && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      padding: '14px',
                      borderRadius: 10,
                      background: 'color-mix(in srgb, var(--primary) 5%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--primary) 18%, transparent)',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                      }}
                    >
                      Live class platform
                      <select
                        value={formData.liveSessionProvider}
                        onChange={(e) => set('liveSessionProvider', e.target.value)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border-color)',
                          background: 'var(--surface-dark)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="LIVEKIT">Built-in live class</option>
                        <option value="GOOGLE_MEET">Google Meet</option>
                      </select>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Google Meet requires an administrator to connect Google Calendar.
                      </span>
                    </label>
                    {formData.liveSessionProvider === 'GOOGLE_MEET' && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Google Meet manages participant limits, chat, and screen sharing. The LMS
                        records joins made through the LMS; it cannot automatically track when
                        participants leave Meet. The session duration limit below applies when
                        scheduling in the LMS.
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {formData.liveSessionProvider !== 'GOOGLE_MEET' && (
                        <>
                          <AdminInput
                            label="Max Participants"
                            type="number"
                            min="1"
                            max="500"
                            value={formData.maxLiveParticipants}
                            onChange={(e) => set('maxLiveParticipants', e.target.value)}
                          />
                          <AdminInput
                            label="Concurrent Sessions"
                            type="number"
                            min="1"
                            max="20"
                            value={formData.maxConcurrentLiveSessions}
                            onChange={(e) => set('maxConcurrentLiveSessions', e.target.value)}
                          />
                          <AdminInput
                            label="Monthly Participant Minutes"
                            type="number"
                            min="1"
                            value={formData.monthlyLiveParticipantMinutes}
                            onChange={(e) => set('monthlyLiveParticipantMinutes', e.target.value)}
                          />
                        </>
                      )}
                      <AdminInput
                        label="Max Session Duration (min)"
                        type="number"
                        min="15"
                        max="480"
                        value={formData.maxLiveSessionDurationMinutes}
                        onChange={(e) => set('maxLiveSessionDurationMinutes', e.target.value)}
                      />
                    </div>
                    {formData.liveSessionProvider !== 'GOOGLE_MEET' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <ToggleRow
                          checked={formData.attendanceEnabled}
                          label="Track Attendance"
                          description="Automatically log participant join/leave events"
                          onChange={(checked) => set('attendanceEnabled', checked)}
                        />
                        <ToggleRow
                          checked={formData.liveChatEnabled}
                          label="Enable In-Class Chat"
                          description="Real-time chat messages during live sessions"
                          onChange={(checked) => set('liveChatEnabled', checked)}
                        />
                        <ToggleRow
                          checked={formData.screenShareEnabled}
                          label="Enable Screen Sharing"
                          description="Allow instructors (and optionally students) to share screens"
                          onChange={(checked) => set('screenShareEnabled', checked)}
                        />
                        <ToggleRow
                          checked={formData.aiTranscriptEnabled}
                          label="AI Transcription (Phase 4)"
                          description="Auto-generate text transcript from session audio"
                          onChange={(checked) => set('aiTranscriptEnabled', checked)}
                        />
                        <ToggleRow
                          checked={formData.aiSummaryEnabled}
                          label="AI Session Summary (Phase 4)"
                          description="Generate AI-powered notes and summary after session"
                          onChange={(checked) => set('aiSummaryEnabled', checked)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        )}

        {(feedback.error || feedback.success) && (
          <div
            role={feedback.error ? 'alert' : 'status'}
            style={{
              marginTop: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: feedback.error ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
              color: feedback.error ? '#f87171' : '#4ade80',
              fontSize: 13,
            }}
          >
            {feedback.error || feedback.success}
          </div>
        )}
        {/* Footer */}
        <div
          style={{
            paddingTop: 20,
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 20,
            flexShrink: 0,
          }}
        >
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            type="submit"
            form="tenant-config-form"
            disabled={configQuery.isError}
            loading={updateMutation.isPending || configQuery.isLoading}
            icon={<Check size={14} />}
          >
            Save Configuration
          </AdminButton>
        </div>
      </div>
    </div>
  );
};

export default TenantConfigDrawer;
