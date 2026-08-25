import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Plus, Globe, GlobeLock, Archive,
  CheckCircle, XCircle, Trash2, LayoutList, LayoutGrid,
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import { AdminModal, AdminConfirmModal } from '../../../components/ui/AdminModal';
import AdminPagination, { AdminEmptyState, AdminErrorState } from '../../../components/ui/AdminPagination';
import PermissionGuard from '../../../guards/PermissionGuard';
import { PERMISSIONS } from '../../../constants/permissions';
import { COURSE_STATUS } from '../constants/courseConstants';
import courseService from '../services/courseService';
import { useToast } from '../../../components/feedback/Toast';

/* ── palette ── */
function getInitials(str = '') {
  return str.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
}

/* ── status ── */
const SC = {
  DRAFT: { label: 'Draft', className: 'status-draft' },
  PENDING_REVIEW: { label: 'Pending', className: 'status-pending' },
  PUBLISHED: { label: 'Ongoing', className: 'status-published' },
  UNPUBLISHED: { label: 'Unpublished', className: 'status-unpublished' },
  ARCHIVED: { label: 'Archived', className: 'status-archived' },
};
function StatusPill({ status }) {
  const c = SC[status] ?? SC.DRAFT;
  // Fallback to inline styles using CSS vars if class isn't defined, but we try to use a standard look
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
function buildActions(course, onAction) {
  const s = course.status, A = [];
  if (s === 'PENDING_REVIEW') {
    A.push({ label: 'Approve', danger: false, onClick: () => onAction('approve', course) });
    A.push({ label: 'Reject', danger: true, onClick: () => onAction('reject', course) });
  }
  if (s === 'DRAFT' || s === 'UNPUBLISHED')
    A.push({ label: 'Publish', danger: false, onClick: () => onAction('publish', course) });
  if (s === 'PUBLISHED')
    A.push({ label: 'Unpublish', danger: false, onClick: () => onAction('unpublish', course) });
  if (s === 'PUBLISHED' || s === 'UNPUBLISHED')
    A.push({ label: 'Archive', danger: true, onClick: () => onAction('archive', course) });
  if (s === 'DRAFT')
    A.push({ label: 'Delete', danger: true, onClick: () => onAction('delete', course) });
  return A;
}

/* ── Exact Match Card (Dark Mode Aware) ── */
function CourseCard({ course, onAction, onClick }) {
  const actions = buildActions(course, onAction);
  const primary = actions[0] ?? null;
  const enroll = course.enrollmentCount ?? 0;
  const progressPct = enroll > 0 ? 45 : 0;

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
        maxWidth: 380, // increased from 340
        cursor: 'pointer', // Indicates it's clickable
        transition: 'transform 0.15s, box-shadow 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      {/* ── top section ── */}
      <div style={{
        background: 'var(--surface-medium)',
        padding: '16px 20px', // reduced top/bottom padding
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* course icon */}
        <div style={{
          width: 48, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-primary)'
        }}>
          <svg viewBox="0 0 256 256" width="48" height="48">
            <path fill="currentColor" d="M128,12L24,52L36,192L128,244L220,192L232,52L128,12Z" opacity="0.1" />
            <path fill="currentColor" d="M128,24L40,58L48,186L128,230L208,186L216,58L128,24Z" opacity="0.2" />
            <path fill="currentColor" d="M128,34L196,182L162,182L146,144L110,144L94,182L60,182L128,34ZM128,78L118,124L138,124L128,78Z" />
          </svg>
        </div>

        {/* status pill */}
        <StatusPill status={course.status} />
      </div>

      {/* ── bottom section ── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1, background: 'var(--lms-card)' }}>

        {/* title + category */}
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
            {course.title}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {course.level ? course.level.charAt(0) + course.level.slice(1).toLowerCase() : 'Frontend Development'}
          </p>
        </div>

        {/* description */}
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description || "Master Angular from the basics to building an advanced application with Firebase's Firestore."}
        </p>

        {/* progress bar */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Progress</span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{progressPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${progressPct}%`, background: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: 'var(--border-color)' }} />

        {/* creator + action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={course.createdByName ?? 'Brad Traversy'} size={34} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {course.createdByName ?? 'Brad Traversy'}
              </p>
              <p style={{ margin: '0', fontSize: 12, color: 'var(--text-muted)' }}>
                Instructor
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); onAction('edit', course); }} style={{
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
  );
}

/* ── List Row (Dark Mode Aware) ── */
function CourseListRow({ course, onAction, onClick }) {
  const actions = buildActions(course, onAction);
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
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</span>
          <StatusPill status={course.status} />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>
          {course.level ? course.level.charAt(0) + course.level.slice(1).toLowerCase() : 'Frontend Development'}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
        <Avatar name={course.createdByName ?? 'Instructor'} size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{course.createdByName ?? 'Brad Traversy'}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
        <button onClick={(e) => { e.stopPropagation(); onAction('edit', course); }} style={{
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
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ ...s, height: 20, width: '60%', marginBottom: 8 }} />
          <div style={{ ...s, height: 16, width: '40%' }} />
        </div>
        <div>
          <div style={{ ...s, height: 16, width: '100%', marginBottom: 6 }} />
          <div style={{ ...s, height: 16, width: '80%' }} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ ...s, height: 14, width: 60 }} />
            <div style={{ ...s, height: 14, width: 30 }} />
          </div>
          <div style={{ ...s, height: 6, borderRadius: 99 }} />
        </div>
        <div style={{ height: 1, background: 'var(--border-color)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ ...s, width: 38, height: 38, borderRadius: '50%' }} />
            <div>
              <div style={{ ...s, height: 16, width: 100, marginBottom: 4 }} />
              <div style={{ ...s, height: 14, width: 60 }} />
            </div>
          </div>
          <div style={{ ...s, width: 80, height: 36, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['ALL', ...Object.values(COURSE_STATUS)];

/* ── Page ── */
export const AdminCourseListPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState('grid');
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createLevel, setCreateLevel] = useState('BEGINNER');
  const [createDuration, setCreateDuration] = useState('');
  const [createSaving, setCreateSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const res = await courseService.list({ page, size: pageSize, search: search || undefined, status: statusFilter === 'ALL' ? undefined : statusFilter });
      const data = res?.data ?? res;
      setCourses(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (err) { setLoadError(err?.message ?? 'Failed to load.'); }
    finally { setLoading(false); }
  }, [page, pageSize, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (course, type, fn, msg) => {
    setConfirmAction(a => ({ ...a, loading: true }));
    try { await fn(course.id); toastSuccess(msg); setConfirmAction(null); load(); }
    catch (err) { toastError(err?.response?.data?.message ?? err?.message ?? 'Failed.'); setConfirmAction(a => ({ ...a, loading: false })); }
  };

  const handleAction = (type, course) => {
    if (type === 'edit') { navigate(`/admin/courses/${course.id}/edit`); return; }
    if (type === 'reject') { setRejectModal({ course, loading: false }); setRejectReason(''); return; }
    const MAP = {
      publish: { fn: courseService.publish, msg: 'Published!' },
      unpublish: { fn: courseService.unpublish, msg: 'Unpublished.' },
      approve: { fn: courseService.approve, msg: 'Approved!' },
      archive: { fn: courseService.archive, msg: 'Archived.' },
      delete: { fn: courseService.remove, msg: 'Deleted.' },
    };
    if (MAP[type]) setConfirmAction({ course, action: type, loading: false, fn: () => doAction(course, type, MAP[type].fn, MAP[type].msg) });
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setRejectModal(m => ({ ...m, loading: true }));
    try { await courseService.reject(rejectModal.course.id, { reason: rejectReason || null }); toastSuccess('Rejected.'); setRejectModal(null); setRejectReason(''); load(); }
    catch (err) { toastError(err?.response?.data?.message ?? 'Failed.'); setRejectModal(m => ({ ...m, loading: false })); }
  };

  const handleCreate = async () => {
    if (!createTitle.trim()) return;
    setCreateSaving(true);
    try {
      await courseService.create({ title: createTitle.trim(), description: createDesc.trim() || undefined, level: createLevel, durationMinutes: createDuration ? parseInt(createDuration) : undefined });
      toastSuccess('Created!'); setCreateModal(false); setCreateTitle(''); setCreateDesc(''); setCreateLevel('BEGINNER'); setCreateDuration(''); load();
    } catch (err) { toastError(err?.response?.data?.message ?? 'Failed.'); }
    finally { setCreateSaving(false); }
  };

  const f = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--lms-card)', color: 'var(--text-primary)', fontSize: 14, fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box', outline: 'none' };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>My Courses</h1>
        </div>
        <PermissionGuard required={[PERMISSIONS.COURSE_CREATE]} fallback={null}>
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={() => setCreateModal(true)}>New Course</AdminButton>
        </PermissionGuard>
      </div>

      {/* filter bar */}
      <div style={{ background: 'var(--lms-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setPage(0), setSearch(searchInput))} placeholder="Search courses…" style={{ ...f, paddingLeft: 36, background: 'var(--lms-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
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
      {loading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : loadError ? (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
          {loadError} <button onClick={load} style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 18 }}>No courses found</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15 }}>{search || statusFilter !== 'ALL' ? 'Try adjusting your search or filter.' : 'Create your first course to get started.'}</p>
        </div>
      ) : view === 'grid' ? (
        <>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {courses.map(c => <CourseCard key={c.id} course={c} onAction={handleAction} onClick={() => navigate(`/admin/courses/${c.id}/edit`)} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {courses.map(c => <CourseListRow key={c.id} course={c} onAction={handleAction} onClick={() => navigate(`/admin/courses/${c.id}/edit`)} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      )}

      {/* confirm action */}
      {confirmAction && (
        <AdminConfirmModal open
          title={`${confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)} Course`}
          description={`Are you sure you want to ${confirmAction.action} "${confirmAction.course.title}"?`}
          confirmLabel={confirmAction.action[0].toUpperCase() + confirmAction.action.slice(1)}
          danger={['delete', 'archive'].includes(confirmAction.action)}
          loading={confirmAction.loading} onConfirm={confirmAction.fn} onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* reject modal */}
      {rejectModal && (
        <AdminModal open title="Reject Course" onClose={() => setRejectModal(null)}>
          <div style={{ padding: '0 20px 20px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Rejecting <strong>{rejectModal.course.title}</strong> will reset it to DRAFT.
            </p>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Tell the creator why…" style={f} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
              <AdminButton variant="ghost" onClick={() => setRejectModal(null)}>Cancel</AdminButton>
              <AdminButton variant="danger" loading={rejectModal.loading} onClick={handleReject}>Reject</AdminButton>
            </div>
          </div>
        </AdminModal>
      )}

      {/* create modal */}
      {createModal && (
        <AdminModal open title="Create Course" onClose={() => setCreateModal(false)}>
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Title *</label>
              <input value={createTitle} onChange={e => setCreateTitle(e.target.value)} placeholder="e.g. Intro to React" style={f} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Description</label>
              <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} rows={3} placeholder="Short overview…" style={{ ...f, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Level</label>
                <select value={createLevel} onChange={e => setCreateLevel(e.target.value)} style={f}>
                  {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => <option key={l} value={l}>{l[0] + l.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Duration (min)</label>
                <input type="number" value={createDuration} onChange={e => setCreateDuration(e.target.value)} placeholder="120" style={f} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <AdminButton variant="ghost" onClick={() => setCreateModal(false)}>Cancel</AdminButton>
              <AdminButton loading={createSaving} onClick={handleCreate} disabled={!createTitle.trim()}>Create</AdminButton>
            </div>
          </div>
        </AdminModal>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default AdminCourseListPage;
