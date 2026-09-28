import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, Calendar, Clock, Search, LayoutGrid, LayoutList,
  GraduationCap, Award, Layers, ExternalLink, RefreshCw, TrendingUp, Plus, Edit2, Mail, Phone, ShieldCheck
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import AdminPagination from '../../../components/ui/AdminPagination';
import { useInstructors } from '../hooks/useInstructors';
import {
  EMPLOYMENT_TYPE_LABEL,
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_TONE,
} from '../constants/instructorConstants';
import { ROUTES } from '../../../constants/routes';

function getInitials(str = '') {
  return str.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || 'IN';
}

function InstructorAvatar({ name = '', size = 44 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: Math.round(size * 0.38),
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {getInitials(name)}
    </div>
  );
}

const ENGAGEMENT_CONFIG = {
  FULL_TIME: { label: 'Full Time', bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: 'rgba(16, 185, 129, 0.35)' },
  PART_TIME: { label: 'Part Time', bg: 'rgba(59, 130, 246, 0.18)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.35)' },
  CONTRACT: { label: 'Contract', bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.35)' },
  VISITING: { label: 'Visiting', bg: 'rgba(168, 85, 247, 0.18)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.35)' },
};

function EngagementPill({ type }) {
  const norm = (type || 'FULL_TIME').toUpperCase();
  const c = ENGAGEMENT_CONFIG[norm] || ENGAGEMENT_CONFIG.FULL_TIME;
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
      {c.label}
    </span>
  );
}

function AccountBadge({ row }) {
  if (row.locked) {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 6,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        Suspended
      </span>
    );
  }
  if (!row.active) {
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 6,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        Pending
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 6,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#34d399',
        border: '1px solid rgba(16, 185, 129, 0.3)',
      }}
    >
      Active
    </span>
  );
}

/* ── Skeleton Card ── */
function SkeletonCard() {
  const s = { background: 'var(--skeleton-bg, #e2e8f0)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' };
  return (
    <div style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.05))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ ...s, width: 80, height: 24, borderRadius: 6 }} />
        <div style={{ ...s, width: 80, height: 24, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ ...s, width: 44, height: 44, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...s, height: 18, width: '70%', marginBottom: 6 }} />
          <div style={{ ...s, height: 12, width: '50%' }} />
        </div>
      </div>
      <div style={{ ...s, height: 36, borderRadius: 10 }} />
      <div style={{ ...s, height: 36, borderRadius: 99, marginTop: 8 }} />
    </div>
  );
}

const ENGAGEMENT_FILTERS = [
  { id: '', label: 'All Faculty' },
  { id: 'FULL_TIME', label: 'Full Time' },
  { id: 'PART_TIME', label: 'Part Time' },
  { id: 'CONTRACT', label: 'Contract' },
  { id: 'VISITING', label: 'Visiting' },
];

const PAGE_SIZE = 12;

export const InstructorListPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('lms_instructor_view_mode') || 'table';
    } catch (_) {
      return 'table';
    }
  });

  const {
    data: pageData,
    isLoading,
    error,
    refetch,
  } = useInstructors({ search, employmentType: employmentType || undefined, page, size: PAGE_SIZE });

  const instructors = useMemo(() => pageData?.content || [], [pageData]);
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  // Telemetry KPIs
  const stats = useMemo(() => {
    const total = totalElements || instructors.length;
    const fullTime = instructors.filter((i) => i.employmentType === 'FULL_TIME').length;
    const active = instructors.filter((i) => !i.locked).length;
    const totalExp = instructors.reduce((acc, i) => acc + (Number(i.yearsOfExperience) || 0), 0);
    const avgExp = instructors.length > 0 ? (totalExp / instructors.length).toFixed(1) : '0';

    return { total, fullTime, active, avgExp };
  }, [instructors, totalElements]);

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Instructors & Faculty
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
            Everyone who teaches at the centre. Manage faculty credentials, engagement types, and assigned cohorts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <AdminButton
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => refetch()}
          >
            Sync Faculty
          </AdminButton>
          <AdminButton
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE)}
          >
            Add New Instructor
          </AdminButton>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {[
          { label: 'Total Faculty', val: stats.total, sub: 'Registered institution educators', icon: Users, tone: '#3b82f6', bg: 'var(--card-blue)', border: 'var(--card-blue-border)' },
          { label: 'Full-Time Staff', val: stats.fullTime, sub: 'Core curriculum instructors', icon: Award, tone: '#10b981', bg: 'var(--card-green)', border: 'var(--card-green-border)' },
          { label: 'Active Faculty', val: stats.active, sub: 'Teaching & evaluating cohorts', icon: TrendingUp, tone: '#f59e0b', bg: 'var(--card-yellow)', border: 'var(--card-yellow-border)' },
          { label: 'Avg Experience', val: `${stats.avgExp} yrs`, sub: 'Cumulative technical depth', icon: Clock, tone: '#8b5cf6', bg: 'var(--card-purple)', border: 'var(--card-purple-border)' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              style={{
                background: m.bg,
                border: `1px solid ${m.border}`,
                borderRadius: 16,
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  {m.label}
                </p>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4, letterSpacing: '-0.02em' }}>
                  {m.val}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                  {m.sub}
                </p>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: `1px solid ${m.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.tone,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          background: 'var(--card, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 16,
          padding: '12px 16px',
          boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)',
                pointerEvents: 'none',
              }}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, email, code or specialization…"
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
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary, #22c55e)'; e.target.style.background = 'var(--card, #ffffff)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border, #e2e8f0)'; e.target.style.background = 'var(--color-bg, #f5f7fa)'; }}
            />
          </div>

          {/* Engagement Status Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'var(--color-bg, #f5f7fa)', padding: 4, borderRadius: 99, border: '1px solid var(--border, #e2e8f0)' }}>
            {ENGAGEMENT_FILTERS.map((f) => {
              const active = employmentType === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setEmploymentType(f.id);
                    setPage(0);
                  }}
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
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-primary, #1a1a2e)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary, #64748b)'; }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 'auto' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--color-bg, #f5f7fa)',
                borderRadius: 10,
                padding: 3,
                gap: 2,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              {[
                { id: 'table', I: LayoutList, title: 'List View' },
                { id: 'grid', I: LayoutGrid, title: 'Grid View' },
              ].map(({ id, I, title }) => (
                <button
                  key={id}
                  onClick={() => {
                    setViewMode(id);
                    try { localStorage.setItem('lms_instructor_view_mode', id); } catch (_) {}
                  }}
                  title={title}
                  style={{
                    padding: '7px 10px',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    background: viewMode === id ? 'var(--card, #ffffff)' : 'transparent',
                    color: viewMode === id ? 'var(--text-primary, #1a1a2e)' : 'var(--text-muted, #94a3b8)',
                    boxShadow: viewMode === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <I size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      {isLoading ? (
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : instructors.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', background: 'var(--lms-card)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <GraduationCap size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-primary)', fontSize: 18 }}>No instructors found</p>
          <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: 14 }}>
            {search || employmentType
              ? 'Try adjusting your search query or reset engagement filters.'
              : 'Onboard your first instructor to see them here.'}
          </p>
          <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate(ROUTES.INSTRUCTOR_CREATE)}>
            Add New Instructor
          </AdminButton>
        </div>
      ) : viewMode === 'grid' ? (
        /* Modern Faculty Grid Cards */
        <div
          style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          }}
        >
          {instructors.map((row) => (
            <div
              key={row.id}
              onClick={() => navigate(ROUTES.INSTRUCTOR_DETAILS(row.id))}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Header: Employee Code & Engagement */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--color-primary, #6366f1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                >
                  {row.employeeCode}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <EngagementPill type={row.employmentType} />
                  <AccountBadge row={row} />
                </div>
              </div>

              {/* Profile Main */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <InstructorAvatar name={row.fullName} size={44} />
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.fullName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    <Mail size={12} color="var(--text-muted)" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialization Box */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  marginBottom: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary, #6366f1)', fontWeight: 600 }}>
                  <BookOpen size={13} />
                  <span>{row.specialization || 'Technical Instructor'}</span>
                </div>
                {row.institution && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {row.highestQualification ? `${row.highestQualification} • ` : ''}{row.institution}
                  </div>
                )}
              </div>

              {/* Metadata row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={13} color="var(--color-primary, #6366f1)" />
                  <span>{row.yearsOfExperience != null ? `${row.yearsOfExperience} yrs exp.` : 'Senior'}</span>
                </span>
                {row.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Phone size={13} color="#10b981" />
                    <span>{row.phone}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderTop: '1px solid var(--border)',
                  paddingTop: 14,
                  marginTop: 'auto',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.INSTRUCTOR_DETAILS(row.id));
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>View Profile</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(ROUTES.INSTRUCTOR_EDIT(row.id));
                  }}
                  title="Edit Profile"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Enterprise Data Table / List View */
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Faculty Member</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Employee ID</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Specialization & Background</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Engagement</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Experience & Contact</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((row) => {
                  const backgroundSubtitle = [row.qualification, row.institution].filter(Boolean).join(' • ');
                  return (
                    <tr
                      key={row.id}
                      onClick={() => navigate(ROUTES.INSTRUCTOR_DETAILS(row.id))}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background-color 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Faculty Member */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <InstructorAvatar name={row.fullName} size={38} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{row.fullName}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                              <span>{row.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            background: 'var(--background)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                            display: 'inline-block',
                          }}
                        >
                          {row.employeeCode || '—'}
                        </span>
                      </td>

                      {/* Specialization & Background */}
                      <td style={{ padding: '14px 18px', maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary, #6366f1)', fontSize: 13 }}>
                          {row.specialization || 'Technical Instructor'}
                        </div>
                        {backgroundSubtitle && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              marginTop: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={backgroundSubtitle}
                          >
                            {backgroundSubtitle}
                          </div>
                        )}
                      </td>

                      {/* Engagement */}
                      <td style={{ padding: '14px 18px' }}>
                        <EngagementPill type={row.employmentType} />
                      </td>

                      {/* Experience & Contact */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {row.yearsOfExperience != null && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-primary)' }}>
                              <Clock size={12} style={{ color: 'var(--color-primary, #6366f1)' }} />
                              <span>{row.yearsOfExperience} yrs exp.</span>
                            </div>
                          )}
                          {row.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                              <Phone size={11} style={{ color: '#10b981' }} />
                              <span>{row.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <AccountBadge row={row} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(ROUTES.INSTRUCTOR_DETAILS(row.id))}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 99,
                              fontSize: 12,
                              fontWeight: 700,
                              border: 'none',
                              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                              color: '#fff',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                              transition: 'all 0.15s',
                            }}
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => navigate(ROUTES.INSTRUCTOR_EDIT(row.id))}
                            title="Edit Profile"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 99,
                              fontSize: 12,
                              fontWeight: 600,
                              border: '1px solid var(--border)',
                              background: 'var(--background)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--background)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modern Admin Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: 24 }}>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
};

export default InstructorListPage;
