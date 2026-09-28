import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, Plus, LayoutList, LayoutGrid, Code, CheckCircle, Copy,
  Clock, Award, FileText, Code2, Shield, Sparkles, BarChart2, CheckCircle2
} from 'lucide-react';
import adminAssessmentService from '../services/adminAssessmentService';
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
  return str.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || 'AS';
}

/* ── status ── */
const SC = {
  DRAFT: { label: 'Draft', bg: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8', border: 'rgba(255, 255, 255, 0.15)' },
  PUBLISHED: { label: 'Published', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  CLOSED: { label: 'Closed', bg: 'rgba(239, 68, 68, 0.18)', color: '#f87171', border: 'rgba(239, 68, 68, 0.35)' },
  ARCHIVED: { label: 'Archived', bg: 'rgba(100, 116, 139, 0.18)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.35)' },
};

function StatusPill({ status }) {
  const c = SC[status] ?? SC.DRAFT;
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      backdropFilter: 'blur(8px)', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {c.label}
    </span>
  );
}

/* ── avatar ── */
function Avatar({ name = '', size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)'
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

/* ── Modern Assessment Card (Figma Theme) ── */
function AssessmentCard({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0] ?? null;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        cursor: 'pointer',
        width: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Visual Header Banner */}
      <div
        style={{
          height: 110,
          background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #818cf8 100%)',
          position: 'relative',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Ambient mesh highlight */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.22) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Evaluation Watermark SVG */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 6,
            opacity: 0.15,
            color: '#fff',
            pointerEvents: 'none',
          }}
        >
          <Code2 size={72} />
        </div>

        {/* Top-Left Category Badge */}
        <div style={{ zIndex: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Code2 size={13} />
            Coding Assessment
          </span>
        </div>

        {/* Top-Right Status */}
        <div style={{ zIndex: 2 }}>
          <StatusPill status={assessment.status} />
        </div>

        {/* Floating Icon Emblem Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary, #6366f1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 3,
          }}
        >
          <Code size={18} />
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1, gap: 14 }}>
        <div>
          <h3
            style={{
              margin: '0 0 6px',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
            }}
          >
            {assessment.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {assessment.description || 'Comprehensive evaluation covering algorithmic reasoning, implementation correctness, and automated grading.'}
          </p>
        </div>

        {/* Metadata Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileText size={13} style={{ color: 'var(--color-primary, #6366f1)' }} /> {assessment.questionCount || 0} Questions
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Clock size={13} style={{ color: '#0ea5e9' }} /> {assessment.durationMinutes || 0} Mins
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f59e0b' }}>
            <Award size={13} /> {assessment.totalMarks || 100} Marks
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10b981' }}>
            <Shield size={13} /> Proctored
          </span>
        </div>

        {/* Score / Weightage Bar */}
        <div style={{ marginTop: 'auto', paddingTop: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Weightage / Score</span>
            <span style={{ color: 'var(--text-primary)' }}>{assessment.totalMarks || 0}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, assessment.totalMarks || 100)}%`,
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Creator & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar name="Platform Admin" size={32} />
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Platform Admin
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Instructor</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, shrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAction('edit', assessment); }}
              style={{
                padding: '6px 13px',
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAction('duplicate', assessment); }}
              title="Duplicate assessment"
              style={{
                padding: '7px 10px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Copy size={14} />
            </button>
            {primary && primary.label !== 'Edit' && (
              <button
                onClick={(e) => { e.stopPropagation(); primary.onClick(); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  border: primary.danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                  background: primary.danger ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: primary.danger ? '#f87171' : '#fff',
                  boxShadow: primary.danger ? 'none' : '0 2px 10px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
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

/* ── Modern List Row (Figma Theme) ── */
function AssessmentListRow({ assessment, onAction, onClick }) {
  const actions = buildActions(assessment, onAction);
  const primary = actions[0];

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        gap: 16,
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary, #6366f1)',
          flexShrink: 0,
        }}
      >
        <Code size={20} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{assessment.title}</span>
          <StatusPill status={assessment.status} />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {assessment.questionCount || 0} Questions • {assessment.durationMinutes || 0} Mins • {assessment.totalMarks || 100} Marks
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
        <Avatar name="Platform Admin" size={32} />
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Platform Admin</p>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>Instructor</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, borderLeft: '1px solid var(--border)', paddingLeft: 16, shrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onAction('edit', assessment); }}
          style={{
            padding: '7px 16px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onAction('duplicate', assessment); }}
          title="Duplicate assessment"
          style={{
            padding: '7px 12px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Copy size={15} />
        </button>
        {primary && primary.label !== 'Edit' && (
          <button
            onClick={(e) => { e.stopPropagation(); primary.onClick(); }}
            style={{
              padding: '7px 16px',
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              border: primary.danger ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
              background: primary.danger ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: primary.danger ? '#f87171' : '#fff',
              cursor: 'pointer',
              boxShadow: primary.danger ? 'none' : '0 2px 10px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            {primary.label}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  const s = { background: 'var(--skeleton-bg, #e2e8f0)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))' }}>
      <div style={{ ...s, height: 120, borderRadius: 0, background: 'var(--skeleton-subtle, #f1f5f9)' }} />
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...s, height: 18, width: '70%' }} />
        <div style={{ ...s, height: 14, width: '90%' }} />
        <div style={{ ...s, height: 6, borderRadius: 99, marginTop: 10 }} />
        <div style={{ height: 1, background: 'var(--border, #e2e8f0)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ ...s, width: 32, height: 32, borderRadius: '50%' }} />
            <div style={{ ...s, height: 14, width: 80 }} />
          </div>
          <div style={{ ...s, width: 64, height: 28, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTERS = ['ALL', ...Object.values(ASSESSMENT_STATUS)];

/* ── Page ── */
export const AdminAssessmentListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success: toastSuccess, error: toastError } = useToast();

  const isInstructor = location.pathname.startsWith('/instructor');
  const detailsRoute = (id) => isInstructor ? ROUTES.INSTRUCTOR_ASSESSMENT_DETAILS(id) : ROUTES.ADMIN_ASSESSMENT_DETAILS(id);
  const createRoute = isInstructor ? ROUTES.ASSESSMENT_CREATE : ROUTES.ADMIN_ASSESSMENT_CREATE;

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
      navigate(detailsRoute(assessment.id));
      return;
    }
    if (type === 'duplicate') {
      adminAssessmentService.duplicate(assessment.id)
        .then(() => {
          toastSuccess(`"${assessment.title}" duplicated into DRAFT!`);
          refetch();
        })
        .catch((err) => {
          toastError(err?.response?.data?.message || err?.message || 'Failed to duplicate assessment.');
        });
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
          <AdminButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate(createRoute)}>New Assessment</AdminButton>
        </PermissionGuard>
      </div>

      {/* filter bar */}
      <div style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--border, #e2e8f0)',
        borderRadius: 16,
        padding: '12px 16px',
        boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)', pointerEvents: 'none' }} />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(0), setSearch(searchInput))}
              placeholder="Search assessments…"
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: 10,
                border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--color-bg, #f5f7fa)',
                color: 'var(--text-primary, #1a1a2e)',
                fontSize: 14,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--primary, #22c55e)'; e.target.style.background = 'var(--card, #ffffff)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border, #e2e8f0)'; e.target.style.background = 'var(--color-bg, #f5f7fa)'; }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--color-bg, #f5f7fa)', padding: 4, borderRadius: 99, border: '1px solid var(--border, #e2e8f0)' }}>
            {STATUS_FILTERS.map(s => {
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  onClick={() => { setPage(0); setStatusFilter(s); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: active ? 'var(--text-primary, #1a1a2e)' : 'transparent',
                    color: active ? 'var(--color-surface, #ffffff)' : 'var(--text-secondary, #64748b)',
                    border: 'none',
                    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary, #1a1a2e)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary, #64748b)'; }}
                >
                  {s === 'ALL' ? 'All' : SC[s]?.label ?? s}
                </button>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 10,
            overflow: 'hidden',
            marginLeft: 'auto',
            background: 'var(--color-bg, #f5f7fa)',
            padding: 3,
            gap: 2,
          }}>
            {[{ id: 'list', I: LayoutList }, { id: 'grid', I: LayoutGrid }].map(({ id, I }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  background: view === id ? 'var(--card, #ffffff)' : 'transparent',
                  color: view === id ? 'var(--text-primary, #1a1a2e)' : 'var(--text-muted, #94a3b8)',
                  boxShadow: view === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
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
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {assessments.map(a => <AssessmentCard key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(detailsRoute(a.id))} />)}
          </div>
          {totalPages > 1 && <div style={{ marginTop: 24 }}><AdminPagination page={page} totalPages={totalPages} totalElements={totalElements} pageSize={pageSize} onPageChange={setPage} /></div>}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {assessments.map(a => <AssessmentListRow key={a.id} assessment={a} onAction={handleAction} onClick={() => navigate(detailsRoute(a.id))} />)}
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
