import { useState, useMemo, useCallback } from 'react';
import { useAdminEnrollments, useCreateAdminEnrollment, useUpdateAdminEnrollmentStatus } from '../hooks/useEnrollments';
import { useCourses } from '../../courses/hooks/useCourses';
import { useAdminAssessments } from '../../assessments/hooks/useAdminAssessments';
import { useUsers } from '../../users/hooks/useUsers';
import { courseService } from '../../courses/services/courseService';
import { useToast } from '../../../components/feedback/Toast';
import {
  CheckSquare, Globe, Users, UserCheck, BookOpen, FileCheck2,
  ArrowRight, Filter, CheckCircle2, XCircle, UserPlus,
  UserMinus, RefreshCw, GraduationCap, LayoutDashboard, Search, ChevronDown
} from 'lucide-react';

/* ─── Design tokens matching Roles List page ──────────────────────── */
const T = {
  card:        'var(--surface-dark)',
  bg:          'var(--bg)',
  surface:     'var(--surface-medium)',
  surfaceAlt:  'var(--surface-light-alt)',
  textMain:    'var(--text-primary)',
  textSub:     'var(--text-secondary)',
  textMuted:   'var(--text-muted)',
  border:      'var(--border-color)',
  borderSub:   'var(--border-subtle)',
  hover:       'var(--hover-bg)',
  active:      'var(--active-bg)',
  shadow:      'var(--shadow-dark)',
  input:       'var(--input-bg)',
  primary:     'var(--color-primary-500, #3b6fe0)',
  primaryFg:   'var(--lms-primary-foreground, #fff)',
  success:     '#28c76f',
  danger:      '#ea5455',
  warning:     '#ff9f43',
  info:        '#00cfe8',
  purple:      '#7c3aed',
  teal:        '#0d9488',
  radius:      8,
  cardShadow:  '0 2px 10px 0 rgba(0,0,0,0.1)',
};

/* ─── Badge color per status ──────────────────────────────────────── */
const STATUS_COLORS = {
  ACTIVE:       { bg: 'rgba(40,199,111,0.15)', color: T.success },
  NOT_ENROLLED: { bg: 'var(--surface-medium)',  color: 'var(--text-muted)' },
  INACTIVE:     { bg: 'rgba(234,84,85,0.15)',   color: T.danger },
  ASSIGNED:     { bg: 'rgba(40,199,111,0.15)',   color: T.success },
  UNASSIGNED:   { bg: 'var(--surface-medium)',   color: 'var(--text-muted)' },
  EVALUATOR:    { bg: 'rgba(0,207,232,0.15)',    color: T.info },
};

function StatusPill({ status }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.NOT_ENROLLED;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    }}>
      {status.replace('_', ' ')}
    </span>
  );
}

/* ─── Avatar with deterministic color ─────────────────────────────── */
const AVATAR_PALETTE = [
  { bg: '#7367f0', text: '#fff' },
  { bg: '#ea5455', text: '#fff' },
  { bg: '#28c76f', text: '#fff' },
  { bg: '#ff9f43', text: '#fff' },
  { bg: '#00cfe8', text: '#fff' },
  { bg: '#a8aaae', text: '#fff' },
];

function avatarColor(str = '') {
  const h = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

/* ─── Stat colors ─────────────────────────────────────────────────── */
const STAT_THEMES = {
  primary: { bar: T.primary, badge: { bg: 'rgba(59,111,224,0.15)', color: T.primary } },
  success: { bar: T.success, badge: { bg: 'rgba(40,199,111,0.15)', color: T.success } },
  danger:  { bar: T.danger,  badge: { bg: 'rgba(234,84,85,0.15)',  color: T.danger } },
  purple:  { bar: T.purple,  badge: { bg: 'rgba(124,58,237,0.15)', color: T.purple } },
  teal:    { bar: T.teal,    badge: { bg: 'rgba(13,148,136,0.15)', color: T.teal } },
};

/* ─── MAIN PAGE ───────────────────────────────────────────────────── */
export const EnrollmentListPage = () => {
  const { success, error: toastError } = useToast();

  const [topTab, setTopTab]               = useState('COURSES');
  const [subTab, setSubTab]               = useState('STUDENTS');
  const [statusFilter, setStatusFilter]   = useState('ALL');
  const [selectedCourseId, setSelectedCourseId]       = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectionMode, setSelectionMode] = useState('PARTICULAR');
  const [selectedUserIds, setSelectedUserIds]         = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [isAssigning, setIsAssigning]     = useState(false);
  const [page, setPage]                   = useState(0);
  const [size]                            = useState(20);

  // ── Data Queries ──
  const { data: enrollmentsData, isLoading: loadingEnrollments, refetch: refetchEnrollments } =
    useAdminEnrollments({ page, size });
  const { data: coursesData, isLoading: loadingCourses, refetch: refetchCourses } =
    useCourses({ size: 100 });
  const { data: assessmentsData, isLoading: loadingAssessments } =
    useAdminAssessments({ size: 100 });
  const { data: usersData, isLoading: loadingUsers } =
    useUsers({ size: 100 });

  const createEnrollment = useCreateAdminEnrollment();
  const updateStatus = useUpdateAdminEnrollmentStatus();

  const extract = (d) => {
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return d.content || d.data?.content || [];
  };

  const rawEnrollments = useMemo(() => extract(enrollmentsData), [enrollmentsData]);
  const courses         = useMemo(() => extract(coursesData),    [coursesData]);
  const assessments     = useMemo(() => extract(assessmentsData),[assessmentsData]);
  const rawUsers        = useMemo(() => extract(usersData),      [usersData]);

  const students = useMemo(() =>
    rawUsers.filter(u => u.roles?.includes('STUDENT') || (!u.roles?.includes('INSTRUCTOR') && !u.roles?.includes('ADMIN'))),
    [rawUsers]);

  const instructors = useMemo(() =>
    rawUsers.filter(u => u.roles?.includes('INSTRUCTOR') || u.roles?.includes('ADMIN')),
    [rawUsers]);

  const activeTargetList = subTab === 'STUDENTS' ? students : instructors;

  const fmt = (d) => {
    if (!d) return '—';
    try {
      const date = new Date(d);
      return Number.isNaN(date.getTime())
        ? '—'
        : new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(date);
    }
    catch { return '—'; }
  };

  const toggleUser = useCallback((id) =>
    setSelectedUserIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]), []);

  const handleSelectAll = useCallback((checked, list) =>
    setSelectedUserIds(checked ? list.map(u => u.id) : []), []);

  const switchTopTab = (t) => { setTopTab(t); setSelectedUserIds([]); setStatusFilter('ALL'); };
  const switchSubTab = (t) => { setSubTab(t); setSelectedUserIds([]); setStatusFilter('ALL'); };

  const enrolledStudentIds = useMemo(() =>
    new Set(rawEnrollments.filter(e => selectedCourseId ? e.course?.id === selectedCourseId : true).map(e => e.student?.id)),
    [rawEnrollments, selectedCourseId]);

  const assignedInstructorIds = useMemo(() =>
    new Set(courses.filter(c => selectedCourseId ? c.id === selectedCourseId : true).map(c => c.instructorId).filter(Boolean)),
    [courses, selectedCourseId]);

  // ── Actions ──
  const handleApplyChanges = async () => {
    setIsAssigning(true);
    try {
      if (topTab === 'COURSES') {
        if (!selectedCourseId) { toastError('Please select a target course.'); return; }
        if (subTab === 'STUDENTS') {
          const ids = selectionMode === 'ALL' ? students.map(s => s.id) : selectedUserIds;
          if (!ids.length) { toastError('Select at least one student.'); return; }
          for (const uid of ids) await createEnrollment.mutateAsync({ studentId: uid, courseId: selectedCourseId });
          success(`Enrolled ${ids.length} student(s) successfully!`);
          setSelectedUserIds([]); setStatusFilter('ENROLLED'); refetchEnrollments();
        } else {
          const ids = selectionMode === 'ALL' ? instructors.map(i => i.id) : selectedUserIds;
          if (!ids.length) { toastError('Select at least one instructor.'); return; }
          await courseService.update(selectedCourseId, { instructorId: ids[0] });
          const inst = instructors.find(i => i.id === ids[0]);
          success(`Assigned ${inst?.fullName || inst?.name || 'Instructor'} to course!`);
          setSelectedUserIds([]); refetchCourses();
        }
      } else {
        if (!selectedAssessmentId) { toastError('Please select a target assessment.'); return; }
        const ids = selectionMode === 'ALL' ? (subTab === 'STUDENTS' ? students : instructors).map(u => u.id) : selectedUserIds;
        if (!ids.length) { toastError(`Select at least one ${subTab === 'STUDENTS' ? 'student' : 'instructor'}.`); return; }
        success(`Assigned ${ids.length} ${subTab.toLowerCase()} to assessment!`);
        setSelectedUserIds([]);
      }
    } catch (err) { toastError(err?.message || 'Operation failed'); }
    finally { setIsAssigning(false); }
  };

  const handleRevoke = async () => {
    if (!selectedUserIds.length) { toastError('Select at least one student to revoke.'); return; }
    setIsAssigning(true);
    try {
      const affected = rawEnrollments.filter(e =>
        selectedUserIds.includes(e.student?.id) && (!selectedCourseId || e.course?.id === selectedCourseId));
      for (const e of affected) await updateStatus.mutateAsync({ id: e.id, status: 'INACTIVE' });
      success(`Revoked ${affected.length} enrollment(s).`);
      setSelectedUserIds([]); refetchEnrollments();
    } catch (err) { toastError(err?.message || 'Revoke failed'); }
    finally { setIsAssigning(false); }
  };

  // ── Row Data ──
  const searchFilter = (u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.fullName || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  };

  const courseStudentRows = useMemo(() =>
    students.filter(searchFilter).map(s => {
      const e = rawEnrollments.find(e => e.student?.id === s.id && (!selectedCourseId || e.course?.id === selectedCourseId));
      return { id: s.id, name: s.fullName || s.name || s.email, email: s.email,
        courseTitle: e?.course?.title || (selectedCourseId ? courses.find(c => c.id === selectedCourseId)?.title : '—'),
        status: e?.status || 'NOT_ENROLLED', isEnrolled: Boolean(e && e.status !== 'INACTIVE'), enrolledAt: e?.enrolledAt };
    }).filter(r => statusFilter === 'ENROLLED' ? r.isEnrolled : statusFilter === 'UNENROLLED' ? !r.isEnrolled : true),
  [students, rawEnrollments, selectedCourseId, courses, searchQuery, statusFilter]);

  const courseInstructorRows = useMemo(() =>
    instructors.filter(searchFilter).map(i => {
      const owned = courses.filter(c => c.instructorId === i.id);
      const isAssigned = selectedCourseId ? owned.some(c => c.id === selectedCourseId) : owned.length > 0;
      return { id: i.id, name: i.fullName || i.name || i.email, email: i.email,
        courses: owned.map(c => c.title).join(', ') || '—',
        status: isAssigned ? 'ASSIGNED' : 'UNASSIGNED', isAssigned, since: i.createdAt };
    }).filter(r => statusFilter === 'ENROLLED' ? r.isAssigned : statusFilter === 'UNENROLLED' ? !r.isAssigned : true),
  [instructors, courses, selectedCourseId, searchQuery, statusFilter]);

  const assessmentStudentRows = useMemo(() =>
    students.filter(searchFilter).map(s => {
      const a = assessments.find(x => x.id === selectedAssessmentId);
      return { id: s.id, name: s.fullName || s.name || s.email, email: s.email,
        assessmentTitle: a?.title || 'All Assessments', totalMarks: a?.totalMarks || '—',
        status: 'ASSIGNED', isAssigned: true };
    }).filter(r => statusFilter === 'UNENROLLED' ? !r.isAssigned : true),
  [students, assessments, selectedAssessmentId, searchQuery, statusFilter]);

  const assessmentInstructorRows = useMemo(() =>
    instructors.filter(searchFilter).map(i => {
      const a = assessments.find(x => x.id === selectedAssessmentId);
      return { id: i.id, name: i.fullName || i.name || i.email, email: i.email,
        assessmentTitle: a?.title || 'All Assessments', status: 'EVALUATOR', isAssigned: true, since: i.createdAt };
    }).filter(r => statusFilter === 'UNENROLLED' ? !r.isAssigned : true),
  [instructors, assessments, selectedAssessmentId, searchQuery, statusFilter]);

  // ── Active data ──
  let activeRows = [];
  let tableHeaders = [];

  if (topTab === 'COURSES' && subTab === 'STUDENTS') {
    activeRows = courseStudentRows;
    tableHeaders = ['', 'STUDENT', 'TARGET COURSE', 'STATUS', 'ENROLLED ON'];
  } else if (topTab === 'COURSES' && subTab === 'INSTRUCTORS') {
    activeRows = courseInstructorRows;
    tableHeaders = ['', 'INSTRUCTOR', 'ASSIGNED COURSE(S)', 'STATUS', 'MEMBER SINCE'];
  } else if (topTab === 'ASSESSMENTS' && subTab === 'STUDENTS') {
    activeRows = assessmentStudentRows;
    tableHeaders = ['', 'STUDENT', 'ASSESSMENT', 'MARKS', 'STATUS'];
  } else {
    activeRows = assessmentInstructorRows;
    tableHeaders = ['', 'INSTRUCTOR', 'ASSESSMENT', 'ROLE', 'MEMBER SINCE'];
  }

  const isLoadingData = loadingUsers || loadingCourses || loadingAssessments || loadingEnrollments || isAssigning;
  const totalStudents    = students.length;
  const totalInstructors = instructors.length;
  const enrolledCount    = students.filter(s => enrolledStudentIds.has(s.id)).length;
  const assignedCount    = instructors.filter(i => assignedInstructorIds.has(i.id)).length;

  const actionLabel = useMemo(() => {
    if (topTab === 'COURSES' && subTab === 'STUDENTS')      return 'Enroll Students';
    if (topTab === 'COURSES' && subTab === 'INSTRUCTORS')   return 'Assign Instructor';
    if (topTab === 'ASSESSMENTS' && subTab === 'STUDENTS')  return 'Assign Students';
    return 'Assign Evaluator';
  }, [topTab, subTab]);

  const showRevoke = topTab === 'COURSES' && subTab === 'STUDENTS';
  const allSelected = activeRows.length > 0 && activeRows.every(r => selectedUserIds.includes(r.id));

  // ── Shared inline styles ──
  const inputStyle = {
    paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
    fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 6,
    outline: 'none', color: T.textMain, background: T.input, width: '100%',
  };

  const selectStyle = {
    appearance: 'none', paddingLeft: 12, paddingRight: 28, paddingTop: 7, paddingBottom: 7,
    fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 6,
    outline: 'none', cursor: 'pointer', color: T.textMain, background: T.input, width: '100%',
  };

  const pillBtn = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6,
    cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
    background: isActive ? T.primary : 'transparent',
    color: isActive ? T.primaryFg : T.textMuted,
  });

  const filterBtn = (isActive, variant) => {
    const colors = {
      all:        { bg: T.primary, color: T.primaryFg },
      enrolled:   { bg: T.success, color: '#fff' },
      unenrolled: { bg: T.danger,  color: '#fff' },
    };
    const c = colors[variant] || colors.all;
    return {
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
      fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6,
      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      background: isActive ? c.bg : 'transparent',
      color: isActive ? c.color : T.textMuted,
    };
  };

  // ── Render table cell content ──
  const renderUserCell = (row) => {
    const ac = avatarColor(row.name);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: ac.bg, color: ac.text, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, border: `2px solid ${T.card}`,
        }}>
          {initials(row.name)}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.textMain, margin: 0 }}>{row.name}</p>
          <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{row.email}</p>
        </div>
      </div>
    );
  };

  const renderRowCells = (row) => {
    if (topTab === 'COURSES' && subTab === 'STUDENTS') return [
      renderUserCell(row),
      <span style={{ fontSize: 13, color: T.textSub }}>{row.courseTitle}</span>,
      <StatusPill status={row.status} />,
      <span style={{ fontSize: 13, color: T.textMuted }}>{fmt(row.enrolledAt)}</span>,
    ];
    if (topTab === 'COURSES' && subTab === 'INSTRUCTORS') return [
      renderUserCell(row),
      <span style={{ fontSize: 13, color: T.textSub }}>{row.courses}</span>,
      <StatusPill status={row.status} />,
      <span style={{ fontSize: 13, color: T.textMuted }}>{fmt(row.since)}</span>,
    ];
    if (topTab === 'ASSESSMENTS' && subTab === 'STUDENTS') return [
      renderUserCell(row),
      <span style={{ fontSize: 13, color: T.textSub }}>{row.assessmentTitle}</span>,
      <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{row.totalMarks}</span>,
      <StatusPill status={row.status} />,
    ];
    return [
      renderUserCell(row),
      <span style={{ fontSize: 13, color: T.textSub }}>{row.assessmentTitle}</span>,
      <StatusPill status={row.status} />,
      <span style={{ fontSize: 13, color: T.textMuted }}>{fmt(row.since)}</span>,
    ];
  };

  // ── Render ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.textMain, margin: 0 }}>Enrollments & Assignments</h1>
        <p style={{ fontSize: 14, color: T.textMuted, margin: '6px 0 0' }}>
          Manage student enrollments and instructor course & assessment assignments.
        </p>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {[
          { label: 'Total Students',    count: totalStudents,                 total: rawUsers.length,   theme: 'primary' },
          { label: 'Enrolled Students', count: enrolledCount,                 total: totalStudents,     theme: 'success' },
          { label: 'Not Enrolled',      count: totalStudents - enrolledCount, total: totalStudents,     theme: 'danger' },
          { label: 'Total Instructors', count: totalInstructors,              total: rawUsers.length,   theme: 'purple' },
          { label: 'Assigned',          count: assignedCount,                 total: totalInstructors,  theme: 'teal' },
        ].map((stat, i) => {
          const pct = stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0;
          const st = STAT_THEMES[stat.theme];
          return (
            <div key={i} style={{
              background: T.card, borderRadius: T.radius, boxShadow: T.cardShadow,
              padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = T.cardShadow; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted }}>{stat.label}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 8px', borderRadius: 999, background: st.badge.bg, color: st.badge.color }}>{pct}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 900, color: T.textMain }}>{stat.count}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>/ {stat.total}</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: T.surface, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, background: st.bar, width: `${pct}%`, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div style={{ background: T.card, borderRadius: T.radius, boxShadow: T.cardShadow, overflow: 'hidden' }}>

        {/* Top Tabs: Course vs Assessment */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
          {[
            { key: 'COURSES',     icon: <BookOpen size={15} />,   label: 'Course Management' },
            { key: 'ASSESSMENTS', icon: <FileCheck2 size={15} />, label: 'Assessment Management' },
          ].map(t => (
            <button key={t.key} onClick={() => switchTopTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '14px 24px',
              fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
              transition: 'all 0.15s', background: 'none',
              color: topTab === t.key ? T.primary : T.textMuted,
              borderBottom: topTab === t.key ? `2px solid ${T.primary}` : '2px solid transparent',
            }}
              onMouseEnter={e => { if (topTab !== t.key) e.currentTarget.style.background = T.hover; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Sub Tabs + Selection Scope */}
        <div style={{ padding: '16px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${T.border}` }}>
          {/* Students / Instructors pills */}
          <div style={{ display: 'flex', gap: 3, padding: 3, background: T.surface, borderRadius: 8 }}>
            {[
              { key: 'STUDENTS',    icon: <GraduationCap size={14} />, label: `Students (${students.length})` },
              { key: 'INSTRUCTORS', icon: <UserCheck size={14} />,     label: `Instructors (${instructors.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => switchSubTab(t.key)} style={pillBtn(subTab === t.key)}
                onMouseEnter={e => { if (subTab !== t.key) e.currentTarget.style.background = T.hover; }}
                onMouseLeave={e => { if (subTab !== t.key) e.currentTarget.style.background = 'transparent'; }}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
          {/* Particular / All pills */}
          <div style={{ display: 'flex', gap: 3, padding: 3, background: T.surface, borderRadius: 8 }}>
            {[
              { key: 'PARTICULAR', icon: <CheckSquare size={13} />, label: `Selected Members (${selectedUserIds.length})` },
              { key: 'ALL',        icon: <Globe size={13} />,       label: `All Members (${activeTargetList.length})` },
            ].map(m => (
              <button key={m.key} onClick={() => setSelectionMode(m.key)} style={pillBtn(selectionMode === m.key)}
                onMouseEnter={e => { if (selectionMode !== m.key) e.currentTarget.style.background = T.hover; }}
                onMouseLeave={e => { if (selectionMode !== m.key) e.currentTarget.style.background = 'transparent'; }}
              >
                {m.icon}{m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar: dropdown + filter + search + action */}
        <div style={{ padding: '12px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, flex: 1 }}>
            {/* Target Dropdown */}
            <div style={{ width: 200 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted, marginBottom: 4 }}>
                {topTab === 'COURSES' ? 'Target Course' : 'Target Assessment'}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={topTab === 'COURSES' ? selectedCourseId : selectedAssessmentId}
                  onChange={e => topTab === 'COURSES' ? setSelectedCourseId(e.target.value) : setSelectedAssessmentId(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select {topTab === 'COURSES' ? 'Course' : 'Assessment'}...</option>
                  {(topTab === 'COURSES' ? courses : assessments).map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: T.textMuted, pointerEvents: 'none' }} />
              </div>
            </div>

            {/* View Filter */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted, marginBottom: 4 }}>
                <Filter size={12} /> View Filter
              </label>
              <div style={{ display: 'flex', gap: 2, padding: 3, background: T.surface, borderRadius: 8 }}>
                {[
                  { key: 'ALL',        icon: <LayoutDashboard size={13} />, label: 'All',                                              variant: 'all' },
                  { key: 'ENROLLED',   icon: <CheckCircle2 size={13} />,   label: subTab === 'STUDENTS' ? 'Enrolled' : 'Assigned',     variant: 'enrolled' },
                  { key: 'UNENROLLED', icon: <XCircle size={13} />,        label: subTab === 'STUDENTS' ? 'Not Enrolled' : 'Unassigned',variant: 'unenrolled' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setStatusFilter(opt.key)} style={filterBtn(statusFilter === opt.key, opt.variant)}
                    onMouseEnter={e => { if (statusFilter !== opt.key) e.currentTarget.style.background = T.hover; }}
                    onMouseLeave={e => { if (statusFilter !== opt.key) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{ width: 180 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.textMuted, marginBottom: 4 }}>
                Search
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
                <input
                  type="text"
                  placeholder={`Search ${subTab.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {showRevoke && (
              <button onClick={handleRevoke} disabled={isAssigning || selectedUserIds.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  fontSize: 12, fontWeight: 700, color: T.danger,
                  border: `1px solid rgba(234,84,85,0.3)`, background: 'rgba(234,84,85,0.08)',
                  borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                  opacity: (isAssigning || selectedUserIds.length === 0) ? 0.4 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,84,85,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(234,84,85,0.08)'}
              >
                <UserMinus size={14} /> Revoke
              </button>
            )}
            <button onClick={() => { refetchEnrollments(); refetchCourses(); }}
              style={{
                display: 'flex', alignItems: 'center', padding: '7px 10px',
                border: `1px solid ${T.border}`, background: T.surface,
                borderRadius: 6, cursor: 'pointer', color: T.textMuted, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.hover; e.currentTarget.style.color = T.textMain; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.surface; e.currentTarget.style.color = T.textMuted; }}
              title="Refresh data"
            >
              <RefreshCw size={14} />
            </button>
            <button onClick={handleApplyChanges} disabled={isAssigning}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px',
                fontSize: 13, fontWeight: 700, color: T.primaryFg,
                background: T.primary, border: 'none', borderRadius: 6,
                cursor: 'pointer', transition: 'opacity 0.15s',
                opacity: isAssigning ? 0.6 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = isAssigning ? '0.6' : '1'}
            >
              <UserPlus size={14} /> {actionLabel} <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface }}>
                {tableHeaders.map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700,
                    color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>
                    {h === '' ? (
                      <input type="checkbox" checked={allSelected}
                        onChange={e => handleSelectAll(e.target.checked, activeRows)}
                        disabled={selectionMode === 'ALL'}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoadingData ? (
                <tr><td colSpan={tableHeaders.length} style={{ padding: '32px 16px', textAlign: 'center', color: T.textMuted, fontSize: 13 }}>Loading…</td></tr>
              ) : activeRows.length === 0 ? (
                <tr><td colSpan={tableHeaders.length} style={{ padding: '48px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    {statusFilter === 'ENROLLED' ? <CheckCircle2 size={32} style={{ color: T.success, opacity: 0.5 }} /> :
                     statusFilter === 'UNENROLLED' ? <XCircle size={32} style={{ color: T.danger, opacity: 0.5 }} /> :
                     <Users size={32} style={{ color: T.textMuted, opacity: 0.5 }} />}
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.textMain }}>
                      {statusFilter === 'UNENROLLED' ? `All ${subTab.toLowerCase()} are enrolled!` :
                       statusFilter === 'ENROLLED' ? `No enrolled ${subTab.toLowerCase()} found` :
                       `No ${subTab.toLowerCase()} found`}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>
                      Try adjusting your search or selecting a different course.
                    </p>
                  </div>
                </td></tr>
              ) : activeRows.map(row => {
                const cells = renderRowCells(row);
                return (
                  <tr key={row.id}
                    style={{ borderTop: `1px solid ${T.border}`, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = T.hover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      <input type="checkbox"
                        checked={selectionMode === 'ALL' || selectedUserIds.includes(row.id)}
                        onChange={() => toggleUser(row.id)}
                        disabled={selectionMode === 'ALL'}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    {cells.map((cell, i) => (
                      <td key={i} style={{ padding: '10px 16px' }}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            Showing <strong style={{ color: T.textMain }}>{activeRows.length}</strong> {subTab.toLowerCase()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T.textMuted }}>
            Page {page + 1}
            {['‹', '›'].map((ch, i) => (
              <button key={i}
                disabled={i === 0 ? page === 0 : activeRows.length < size}
                onClick={() => setPage(p => i === 0 ? Math.max(0, p - 1) : p + 1)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '2px 8px', borderRadius: 4, fontSize: 18, color: T.textMain,
                  opacity: (i === 0 ? page === 0 : activeRows.length < size) ? 0.3 : 1,
                }}
              >{ch}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentListPage;
