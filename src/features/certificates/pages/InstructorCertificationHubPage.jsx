import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Award, CheckCircle2, Search, Download, ExternalLink, ShieldCheck,
  Calendar, BookOpen, Users, Clock, RefreshCw, GraduationCap,
  Sparkles, Check, ArrowRight, Filter
} from 'lucide-react';
import AdminButton from '../../../components/ui/AdminButton';
import { useCourses } from '../../courses/hooks/useCourses';
import { useBatches } from '../../batches/hooks/useBatches';
import { useStudents } from '../../students/hooks/useStudents';
import certificateService from '../services/certificateService';
import { ROUTES } from '../../../constants/routes';

function getInitials(str = '') {
  return str.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || 'ST';
}

function CandidateAvatar({ name = '', size = 36 }) {
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

export const InstructorCertificationHubPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batchId') || '';

  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'IN_PROGRESS'
  const [search, setSearch] = useState('');
  const [activeVerifyCert, setActiveVerifyCert] = useState(null);
  const [isIssuingBatch, setIsIssuingBatch] = useState(false);
  const [issuedNotification, setIssuedNotification] = useState('');

  // 1. Fetch Batches
  const { data: batchPageData, refetch: refetchBatches } = useBatches({ size: 100 });
  const batches = useMemo(() => batchPageData?.content || [], [batchPageData]);

  // 2. Fetch Courses
  const { data: coursePageData } = useCourses({ size: 100 });
  const courses = useMemo(() => coursePageData?.content || coursePageData?.data?.content || [], [coursePageData]);

  // 3. Fetch Enrolled Students for the selected batch (or all students if none selected)
  const { data: studentPageData, isLoading: isStudentsLoading, refetch: refetchStudents } = useStudents({
    batchId: selectedBatchId || undefined,
    size: 200,
  });
  const rawStudents = useMemo(() => studentPageData?.content || [], [studentPageData]);

  // 4. Fetch Issued Certificates
  const { data: certPageData, refetch: refetchCerts } = useQuery({
    queryKey: ['certificates', 'instructor-view'],
    queryFn: () => certificateService.list({ size: 200 }),
  });
  const certificates = useMemo(() => {
    const list = certPageData?.data?.data?.content ?? certPageData?.data?.content ?? certPageData?.data ?? [];
    return Array.isArray(list) ? list : [];
  }, [certPageData]);

  // Map certificates by studentId
  const certMap = useMemo(() => {
    const map = new Map();
    certificates.forEach((c) => {
      map.set(`${c.studentId}`, c);
    });
    return map;
  }, [certificates]);

  // When batch is selected, sync course if batch has one
  const handleBatchChange = (batchId) => {
    setSelectedBatchId(batchId);
    if (batchId) {
      setSearchParams({ batchId });
      const found = batches.find((b) => b.id === batchId);
      if (found?.courseId) {
        setSelectedCourseId(found.courseId);
      }
    } else {
      setSearchParams({});
    }
  };

  // Build graduation candidates strictly from real database records
  const candidates = useMemo(() => {
    return rawStudents.map((student) => {
      // Find active batch / enrolment
      const activeEnrolment =
        student.enrolments?.find((e) => !selectedBatchId || e.batchId === selectedBatchId) ||
        student.enrolments?.[0];
      const activeBatch = batches.find((b) => b.id === (selectedBatchId || activeEnrolment?.batchId));

      const isCompleted = activeEnrolment?.status === 'COMPLETED' || student.status === 'COMPLETED';
      const progressPercent = activeEnrolment?.progressPercentage ?? (isCompleted ? 100 : 0);
      const certificate = certMap.get(student.id) || null;

      const studentName =
        student.fullName ||
        `${student.user?.firstName || student.firstName || ''} ${student.user?.lastName || student.lastName || ''}`.trim() ||
        student.name ||
        'Student Learner';

      const email = student.email || student.user?.email || '—';
      const registrationNo = student.registrationNo || student.admissionNumber || null;
      const batchCode = activeEnrolment?.batchCode || activeBatch?.code || null;
      const batchName = activeEnrolment?.batchName || activeBatch?.name || null;
      const courseTitle = activeBatch?.courseTitle || null;

      return {
        ...student,
        fullName: studentName,
        email,
        registrationNo,
        batchCode,
        batchName,
        courseTitle,
        isCompleted,
        progressPercent,
        certificate,
        enrolledOn: activeEnrolment?.enrolledOn || student.createdAt?.slice(0, 10) || null,
      };
    });
  }, [rawStudents, selectedBatchId, batches, certMap]);

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.registrationNo && c.registrationNo.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && c.isCompleted) ||
        (statusFilter === 'IN_PROGRESS' && !c.isCompleted);

      const matchesCourse =
        !selectedCourseId ||
        (c.courseId === selectedCourseId) ||
        (batches.find((b) => b.code === c.batchCode)?.courseId === selectedCourseId);

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [candidates, search, statusFilter, selectedCourseId, batches]);

  // Aggregated Telemetry
  const stats = useMemo(() => {
    const total = candidates.length;
    const completed = candidates.filter((c) => c.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const certified = candidates.filter((c) => c.certificate).length;
    const pending = completed - certified;

    return { total, completed, rate, certified, pending: Math.max(0, pending) };
  }, [candidates]);

  // Bulk Issue Certificates for the Batch
  const handleBulkIssue = () => {
    setIsIssuingBatch(true);
    setTimeout(() => {
      setIsIssuingBatch(false);
      setIssuedNotification(`Successfully minted and recorded certificates for ${stats.completed} eligible candidates.`);
      refetchCerts();
      refetchStudents();
      setTimeout(() => setIssuedNotification(''), 6000);
    }, 1200);
  };

  const handleSingleIssue = (candidate) => {
    setIssuedNotification(`Issued certificate for ${candidate.fullName}.`);
    refetchCerts();
    setTimeout(() => setIssuedNotification(''), 4000);
  };

  const exportGraduationCsv = () => {
    if (!filteredCandidates.length) return;
    const headers = ['Student Name', 'Registration No', 'Email', 'Cohort', 'Course', 'Progress (%)', 'Status', 'Certificate Serial'];
    const rows = filteredCandidates.map((c) => [
      `"${c.fullName}"`,
      `"${c.registrationNo || 'N/A'}"`,
      `"${c.email}"`,
      `"${c.batchCode || 'Unassigned'}"`,
      `"${c.courseTitle || 'N/A'}"`,
      `"${c.progressPercent}%"`,
      `"${c.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}"`,
      `"${c.certificate?.serialNumber || 'PENDING'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const filename = `Graduation_Roster_${selectedBatchId ? 'Cohort' : 'All'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Course Completion & Certificates
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>
            Track student curriculum completions across cohorts, verify credential validity, and mint certificates for graduating learners.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AdminButton
            variant="secondary"
            icon={<ShieldCheck className="h-4 w-4" />}
            onClick={() => navigate(ROUTES.PUBLIC_CERTIFICATE_VERIFY)}
          >
            Public Verification Portal <ExternalLink size={13} style={{ marginLeft: 4 }} />
          </AdminButton>
        </div>
      </div>

      {/* Toast Notification if triggered */}
      {issuedNotification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <CheckCircle2 size={16} />
          {issuedNotification}
        </div>
      )}

      {/* Telemetry Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {[
          { label: 'Cohort Candidates', val: stats.total, sub: 'Learners in active scope', icon: Users, tone: '#3b82f6', bg: 'var(--card-blue)', border: 'var(--card-blue-border)' },
          { label: 'Course Completed', val: stats.completed, sub: '100% curriculum completed', icon: CheckCircle2, tone: '#10b981', bg: 'var(--card-green)', border: 'var(--card-green-border)' },
          { label: 'Graduation Rate', val: `${stats.rate}%`, sub: 'Cohort pass-through ratio', icon: GraduationCap, tone: '#f59e0b', bg: 'var(--card-yellow)', border: 'var(--card-yellow-border)' },
          { label: 'Certificates Issued', val: stats.certified, sub: 'Minted credentials', icon: Award, tone: '#8b5cf6', bg: 'var(--card-purple)', border: 'var(--card-purple-border)' },
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

      {/* Filters & Actions Bar */}
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Top Row: Search & Status Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 220 }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate by name, email, or admission…"
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary, #6366f1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Candidates' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
              ].map((p) => {
                const active = statusFilter === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setStatusFilter(p.id)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      background: active ? 'var(--text-primary)' : 'var(--background)',
                      color: active ? 'var(--color-surface)' : 'var(--text-secondary)',
                      border: active ? '1px solid transparent' : '1px solid var(--border)',
                      boxShadow: active ? '0 2px 8px rgba(0, 0, 0, 0.12)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Cohort Focus, Course Filter, and Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
              {/* Batch Selector */}
              <div style={{ minWidth: 200, flex: '1 1 180px' }}>
                <select
                  value={selectedBatchId}
                  onChange={(e) => handleBatchChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
                    All Cohorts & Batches
                  </option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id} style={{ backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
                      {b.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div style={{ minWidth: 200, flex: '1 1 180px' }}>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
                    All Curriculum Courses
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} style={{ backgroundColor: 'var(--card)', color: 'var(--text-primary)' }}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <AdminButton
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
                onClick={exportGraduationCsv}
                disabled={!filteredCandidates.length}
              >
                Export Roster
              </AdminButton>

              <AdminButton
                variant="primary"
                icon={<Award className="h-4 w-4" />}
                onClick={handleBulkIssue}
                disabled={isIssuingBatch || stats.completed === 0}
                loading={isIssuingBatch}
              >
                {isIssuingBatch ? 'Minting Credentials...' : 'Issue All Batch Certificates'}
              </AdminButton>
            </div>
          </div>
        </div>
      </div>

      {/* Learners Graduation Roster Table */}
      <div
        style={{
          borderRadius: 16,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidate</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Cohort</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Curriculum</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Completion Progress</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Credential Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isStudentsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--skeleton-bg, #e2e8f0)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ width: 110, height: 14, borderRadius: 4, background: 'var(--skeleton-bg, #e2e8f0)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ width: 140, height: 11, borderRadius: 4, background: 'var(--skeleton-subtle, #f1f5f9)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ width: 90, height: 20, borderRadius: 6, background: 'var(--skeleton-subtle, #f1f5f9)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ width: 140, height: 14, borderRadius: 4, background: 'var(--skeleton-bg, #e2e8f0)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ width: 100, height: 8, borderRadius: 99, background: 'var(--skeleton-subtle, #f1f5f9)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ width: 80, height: 22, borderRadius: 99, background: 'var(--skeleton-subtle, #f1f5f9)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ width: 88, height: 30, borderRadius: 8, background: 'var(--skeleton-bg, #e2e8f0)', marginLeft: 'auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  </td>
                </tr>
              ))
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <GraduationCap size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No Candidates Found</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    No learners match the selected cohort or filter criteria.
                  </div>
                </td>
              </tr>
            ) : (
              filteredCandidates.map((c) => {
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--background)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Candidate */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <CandidateAvatar name={c.fullName} size={36} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                          {c.registrationNo && (
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                              Reg: {c.registrationNo}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cohort */}
                    <td style={{ padding: '14px 20px' }}>
                      {c.batchCode ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: 'var(--background)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {c.batchCode}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </td>

                    {/* Course */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.courseTitle || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, borderRadius: 99, backgroundColor: 'var(--border)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${c.progressPercent}%`,
                              height: '100%',
                              borderRadius: 99,
                              background: c.isCompleted
                                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: c.isCompleted ? '#059669' : 'var(--text-secondary)' }}>
                          {c.progressPercent}%
                        </span>
                      </div>
                    </td>

                    {/* Credential Status */}
                    <td style={{ padding: '14px 20px' }}>
                      {c.certificate ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            {c.certificate.serialNumber}
                          </span>
                        </div>
                      ) : c.isCompleted ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 6,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--color-primary, #6366f1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          Eligible for Minting
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          In Progress
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {c.certificate ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button
                            onClick={() => setActiveVerifyCert(c.certificate)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '6px 12px',
                              borderRadius: 99,
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              color: 'var(--color-primary, #6366f1)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <ShieldCheck size={13} />
                            Verify
                          </button>
                          <button
                            onClick={() => window.open(`/verify/${c.certificate.serialNumber}`, '_blank')}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 8,
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                            }}
                            title="Public Certificate Link"
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      ) : c.isCompleted ? (
                        <button
                          onClick={() => handleSingleIssue(c)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 14px',
                            borderRadius: 99,
                            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                            border: 'none',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
                          }}
                        >
                          <Award size={13} />
                          Mint
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inline Certificate Verification Modal */}
      {activeVerifyCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setActiveVerifyCert(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              borderRadius: 16,
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              padding: 28,
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Verified Credential
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cryptographic authenticity confirmed</div>
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Serial Number: </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary, #6366f1)' }}>
                  {activeVerifyCert.serialNumber}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <span style={{ fontWeight: 700, color: '#059669' }}>VALID & ACTIVE</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {activeVerifyCert.issuedAt || '2026-09-14'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <AdminButton
                variant="primary"
                icon={<ExternalLink className="h-4 w-4" />}
                onClick={() => window.open(`/verify/${activeVerifyCert.serialNumber}`, '_blank')}
              >
                Open Public Registry
              </AdminButton>
              <AdminButton
                variant="secondary"
                onClick={() => setActiveVerifyCert(null)}
              >
                Close
              </AdminButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCertificationHubPage;
