import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Plus, LayoutList, LayoutGrid, Code, CheckCircle
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import { AdminConfirmModal } from '../../../components/ui/AdminModal';
import AdminPagination from '../../../components/ui/AdminPagination';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import { ASSESSMENT_STATUS } from '../constants/assessmentConstants';
import { useToast } from '../../../components/feedback/Toast';
import { ROUTES } from '../../../constants/routes';
import {
  useAdminAssessments,
  usePublishAssessment,
  useUnpublishAssessment,
  useCloseAssessment,
  useArchiveAssessment,
  useDeleteAdminAssessment,
} from '../hooks/useAdminAssessments';

/* ── palette ── */
function getInitials(str = '') {
  return str.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

/* ── status ── */
const SC = {
  DRAFT: { label: 'Draft', className: 'status-draft' },
  PUBLISHED: { label: 'Published', className: 'status-published' },
  CLOSED: { label: 'Closed', className: 'status-closed' },
  ARCHIVED: { label: 'Archived', className: 'status-archived' },
};

function StatusPill({ status }) {
  const c = SC[status] ?? SC.DRAFT;
  const isDraft = status === 'DRAFT' || !status;
  const bg = isDraft ? 'var(--surface-medium)' : 'rgba(37, 99, 235, 0.1)';
  const color = isDraft ? 'var(--text-muted)' : '#3b82f6';
  const border = isDraft ? 'var(--border-color)' : 'rgba(59, 130, 246, 0.3)';

  return (
    <span style={{
      padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 500,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: bg, color: color, border: `1px solid ${border}`, whiteSpace: 'nowrap'
    }}>
      {c.label}
    </span>
  );
}

/* ── avatar ── */
function Avatar({ name = '', size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--text-primary)', color: 'var(--lms-background)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: size * 0.4, fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ── action builder ── */
function buildActions(assessment, onAction) {
  const s = assessment.status, A = [];
  if (s === 'DRAFT') {
    A.push({ label: 'Publish', danger: false, onClick: () => onAction('publish', assessment) });
    A.push({ label: 'Delete', danger: true, onClick: () => onAction('delete', assessment) });
  }
  if (s === 'PUBLISHED') {
    A.push({ label: 'Unpublish', danger: false, onClick: () => onAction('unpublish', assessment) });
    A.push({ label: 'Close', danger: true, onClick: () => onAction('close', assessment) });
  }
  if (s === 'CLOSED' || s === 'PUBLISHED') {
    A.push({ label: 'Archive', danger: true, onClick: () => onAction('archive', assessment) });
  }
  return A;
}

/* ── Exact Match Card (Dark Mode Aware) ── */
function AssessmentCard({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0] ?? null;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--lms-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: 380,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      {/* ── top section ── */}
      <div style={{
        background: 'var(--surface-medium)',
        padding: '16px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* icon */}
        <div style={{
          width: 48, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)',
          background: 'var(--lms-card)',
          borderRadius: 12,
          border: '1px solid var(--border-color)'
        }}>
          <Code size={24} />
        </div>

        {/* status pill */}
        <StatusPill status={assessment.status} />
      </div>

      {/* ── bottom section ── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--lms-card)' }}>

        {/* Content top: title, meta, description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {assessment.title}
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
            {assessment.questionCount || 0} Questions • {assessment.durationMinutes || 0} Mins
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {assessment.description || "No description provided."}
          </p>
        </div>

        {/* Content bottom: extra details, creator, actions */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Total Score</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{assessment.totalMarks || 0}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
             <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(100, assessment.totalMarks || 100)}%`, background: 'var(--surface-medium)' }} />
          </div>

          <div style={{ height: 1, background: 'var(--border-color)', margin: '16px 0' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name="Platform Admin" size={32} />
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Platform Admin
                </p>
              </div>
            </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); onAction('edit', assessment); }} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Edit
            </button>
            {primary && primary.label !== 'Edit' && (
              <button onClick={(e) => { e.stopPropagation(); primary.onClick(); }} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
                border: primary.danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                background: primary.danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--text-primary)',
                color: primary.danger ? '#ef4444' : 'var(--lms-background)',
                transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {primary.label}
              </button>
            )}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}

/* ── List Row (Dark Mode Aware) ── */
function AssessmentListRow({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--lms-card)', border: '1px solid var(--border-color)', borderRadius: 12,
        display: 'flex', alignItems: 'center', padding: '16px', gap: 16,
        fontFamily: 'system-ui, -apple-system, sans-serif', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{assessment.title}</span>
          <StatusPill status={assessment.status} />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          {assessment.questionCount || 0} Questions • {assessment.durationMinutes || 0} Mins
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
        <Avatar name="Platform Admin" size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Platform Admin</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
        <button onClick={(e) => { e.stopPropagation(); onAction('edit', assessment); }} style={{
          padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, 
          border: '1px solid var(--border-color)', background: 'transparent',
          color: 'var(--text-primary)', cursor: 'pointer'
        }}>Edit</button>
        {primary && primary.label !== 'Edit' && (
          <button onClick={(e) => { e.stopPropagation(); primary.onClick(); }} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none',
            background: primary.danger ? 'rgba(239, 68, 68, 0.1)' : 'var(--text-primary)',
            color: primary.danger ? '#ef4444' : 'var(--lms-background)', cursor: 'pointer'
          }}>{primary.label}</button>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonCard() {
  const s = { background: 'var(--border-color)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ background: 'var(--lms-card)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ background: 'var(--surface-medium)', padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ ...s, width: 48, height: 48, borderRadius: 12 }} />
        <div style={{ ...s, width: 70, height: 26, borderRadius: 99 }} />
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ ...s, height: 18, width: '60%' }} />
          <div style={{ ...s, height: 14, width: '40%' }} />
          <div style={{ ...s, height: 14, width: '100%', marginTop: 4 }} />
          <div style={{ ...s, height: 14, width: '80%' }} />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ ...s, height: 12, width: 60 }} />
            <div style={{ ...s, height: 12, width: 30 }} />
          </div>
          <div style={{ ...s, height: 6, borderRadius: 99 }} />
          <div style={{ height: 1, background: 'var(--border-color)', margin: '16px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ ...s, width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ ...s, height: 14, width: 100 }} />
            </div>
            <div style={{ ...s, width: 70, height: 32, borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['ALL', ...Object.values(ASSESSMENT_STATUS)];

/* ── Page ── */
export const AdminAssessmentListPage = () => {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();

  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState('grid');
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading, error, refetch } = useAdminAssessments({
    page,
    size: pageSize,
    search: search || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const publishMut   = usePublishAssessment();
  const unpublishMut = useUnpublishAssessment();
  const closeMut     = useCloseAssessment();
  const archiveMut   = useArchiveAssessment();
  const deleteMut    = useDeleteAdminAssessment();

  const assessments = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const doAction = async (assessment, actionType, mutation, msg) => {
    setConfirmAction(a => ({ ...a, loading: true }));
    try {
      await mutation.mutateAsync(assessment.id);
      toastSuccess(msg);
      setConfirmAction(null);
    } catch (err) {
      toastError(err?.message ?? 'Failed.');
      setConfirmAction(a => ({ ...a, loading: false }));
    }
  };

  const handleAction = (type, assessment) => {
    if (type === 'edit') {
      navigate(ROUTES.ADMIN_ASSESSMENT_DETAILS(assessment.id));
      return;
    }
    const MAP = {
      publish: { mutation: publishMut, msg: 'Published!' },
      unpublish: { mutation: unpublishMut, msg: 'Unpublished.' },
      close: { mutation: closeMut, msg: 'Closed.' },
      archive: { mutation: archiveMut, msg: 'Archived.' },
      delete: { mutation: deleteMut, msg: 'Deleted.' },
    };
    if (MAP[type]) {
      setConfirmAction({
        assessment,
        action: type,
        loading: false,
        fn: () => doAction(assessment, type, MAP[type].mutation, MAP[type].msg)
      });
    }
  };

  const f = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--lms-card)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', outline: 'none' };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Assessments</h1>
        </div>
        <PermissionGuard required={[PERMISSIONS.ASSESSMENT_CREATE]} fallback={null}>
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate(ROUTES.ADMIN_ASSESSMENT_CREATE)}>New Assessment</AdminButton>
        </PermissionGuard>
      </div>

      {/* filter bar */}
      <div style={{ background: 'var(--lms-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(0), setSearch(searchInput))} placeholder="Search assessments…" style={{ ...f, paddingLeft: 36, background: 'var(--lms-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => { setPage(0); setStatusFilter(s); }} style={{
                padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                background: statusFilter === s ? 'var(--text-primary)' : 'transparent',
                color: statusFilter === s ? 'var(--lms-background)' : 'var(--text-secondary)',
                border: statusFilter === s ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}>
                {s === 'ALL' ? 'All' : SC[s]?.label ?? s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden', marginLeft: 'auto' }}>
            {[{ id: 'list', I: LayoutList }, { id: 'grid', I: LayoutGrid }].map(({ id, I }) => (
              <button key={id} onClick={() => setView(id)} style={{ padding: '8px 12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', background: view === id ? 'var(--surface-medium)' : 'transparent', color: view === id ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                <I size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          {error?.message ?? 'Failed to load assessments.'} <button onClick={refetch} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      ) : assessments.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 18 }}>No assessments found</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15 }}>{search || statusFilter !== 'ALL' ? 'Try adjusting your search or filter.' : 'Create your first assessment to get started.'}</p>
        </div>
      ) : view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {assessments.map(a => <AssessmentCard key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(ROUTES.ADMIN_ASSESSMENT_DETAILS(a.id))} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assessments.map(a => <AssessmentListRow key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(ROUTES.ADMIN_ASSESSMENT_DETAILS(a.id))} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      )}

      {/* confirm action */}
      {confirmAction && (
        <AdminConfirmModal open
          title={`${confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)} Assessment`}
          description={`Are you sure you want to ${confirmAction.action} "${confirmAction.assessment.title}"?`}
          confirmLabel={confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)}
          danger={['delete', 'archive', 'close'].includes(confirmAction.action)}
          loading={confirmAction.loading} onConfirm={confirmAction.fn} onCancel={() => setConfirmAction(null)}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default AdminAssessmentListPage;
