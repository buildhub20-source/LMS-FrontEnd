import { useState } from 'react';
import {
  Users, UserCheck, UserX, CheckCircle, Award, BarChart2,
  Search, Filter, Calendar, Clock, Percent, ArrowUpRight,
  TrendingUp, AlertCircle, FileCheck, CheckCircle2, XCircle
} from 'lucide-react';
import { useAdminAssessmentAnalytics } from '../hooks/useAdminAssessments';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import Badge from '../../../components/common/Badge';
import { formatDate } from '../../../utils/dateUtils';

export const AssessmentAnalyticsTab = ({ assessmentId }) => {
  const { data: analytics, isLoading, error } = useAdminAssessmentAnalytics(assessmentId);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  if (isLoading) return <Spinner fullPage={false} />;
  if (error) return <Alert tone="error">Failed to load assessment statistics: {error.message}</Alert>;
  if (!analytics) return null;

  const {
    totalEnrolledStudents = 0,
    attendedCount = 0,
    nonAttendedCount = 0,
    completedCount = 0,
    inProgressCount = 0,
    pendingGradingCount = 0,
    passedCount = 0,
    failedCount = 0,
    passPercentage = 0,
    averageScore = 0,
    averageCompletionPercentage = 0,
    highestScore = 0,
    lowestScore = 0,
    studentStats = [],
    scoreDistribution = [],
    gradeDistribution = []
  } = analytics;

  // Filter students
  const filteredStudents = studentStats.filter((s) => {
    const matchesSearch =
      (s.studentName && s.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentEmail && s.studentEmail.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      s.status === statusFilter ||
      (statusFilter === 'PASSED' && s.passed) ||
      (statusFilter === 'FAILED' && s.passed === false);

    const matchesGrade = gradeFilter === 'ALL' || s.gradeLetter === gradeFilter;

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const maxBucketCount = Math.max(...scoreDistribution.map((b) => b.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── 1. Top Stat Cards Grid (Grading System Integration) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {/* Pass Rate */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Pass Rate</span>
            <div style={iconBoxStyle('rgba(16, 185, 129, 0.1)', '#10b981')}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ ...valueStyle, color: '#10b981' }}>{passPercentage}%</div>
          <span style={subtextStyle}>{passedCount} passed / {failedCount} failed</span>
        </div>

        {/* Average Score */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Average Score</span>
            <div style={iconBoxStyle('rgba(245, 158, 11, 0.1)', '#f59e0b')}>
              <Award size={18} />
            </div>
          </div>
          <div style={valueStyle}>
            {averageScore} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {analytics.totalMarks}</span>
          </div>
          <span style={subtextStyle}>{averageCompletionPercentage}% average completion</span>
        </div>

        {/* Highest / Lowest */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Score Range</span>
            <div style={iconBoxStyle('rgba(99, 102, 241, 0.1)', '#6366f1')}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={valueStyle}>
            {highestScore} <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {lowestScore} min</span>
          </div>
          <span style={subtextStyle}>Highest vs Lowest marks</span>
        </div>

        {/* Pending Grading */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Pending Review</span>
            <div style={iconBoxStyle('rgba(239, 68, 68, 0.1)', '#ef4444')}>
              <FileCheck size={18} />
            </div>
          </div>
          <div style={valueStyle}>{pendingGradingCount}</div>
          <span style={subtextStyle}>Submissions requiring evaluation</span>
        </div>

        {/* Enrolled */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={labelStyle}>Total Enrolled</span>
            <div style={iconBoxStyle('rgba(59, 130, 246, 0.1)', '#3b82f6')}>
              <Users size={18} />
            </div>
          </div>
          <div style={valueStyle}>{totalEnrolledStudents}</div>
          <span style={subtextStyle}>{attendedCount} attended ({totalEnrolledStudents > 0 ? Math.round((attendedCount / totalEnrolledStudents) * 100) : 0}%)</span>
        </div>
      </div>

      {/* ── 2. Letter Grade Distribution System Breakdown ── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Award size={18} style={{ color: '#8b5cf6' }} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Assessment Letter Grade Distribution
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {gradeDistribution.map((g) => {
            const colors = {
              A: { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
              B: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
              C: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
              D: { bg: '#fef2f2', border: '#f97316', text: '#c2410c' },
              F: { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
            }[g.gradeLetter] || { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' };

            return (
              <div
                key={g.gradeLetter}
                onClick={() => setGradeFilter(gradeFilter === g.gradeLetter ? 'ALL' : g.gradeLetter)}
                style={{
                  background: colors.bg,
                  border: `2px solid ${gradeFilter === g.gradeLetter ? colors.text : colors.border}`,
                  borderRadius: 10,
                  padding: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: gradeFilter === g.gradeLetter ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>
                    Grade {g.gradeLetter}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, opacity: 0.8 }}>
                    {g.label}
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: 6, color: 'var(--text-primary)' }}>
                  {g.count} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>students</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.text, fontWeight: 600, marginTop: 2 }}>
                  {g.percentage}% of graded
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Score Distribution & Attendance Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Score Distribution Chart */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart2 size={18} style={{ color: '#3b82f6' }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Score Distribution Histogram
            </h3>
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
            Student count bucketed by score percentage ranges.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', height: 160, gap: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-color)' }}>
            {scoreDistribution.map((b) => {
              const heightPct = Math.round((b.count / maxBucketCount) * 100);
              return (
                <div key={b.rangeLabel} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {b.count}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${Math.max(heightPct, 6)}%`,
                      background: heightPct > 0 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--surface-medium)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease-in-out'
                    }}
                    title={`${b.rangeLabel}: ${b.count} students`}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>{b.rangeLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Percent size={18} style={{ color: '#10b981' }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
              Participation Breakdown
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Attended Students</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {attendedCount} / {totalEnrolledStudents} ({totalEnrolledStudents > 0 ? Math.round((attendedCount / totalEnrolledStudents) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalEnrolledStudents > 0 ? (attendedCount / totalEnrolledStudents) * 100 : 0}%`, background: '#10b981', borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Completed Test</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {completedCount} / {totalEnrolledStudents} ({totalEnrolledStudents > 0 ? Math.round((completedCount / totalEnrolledStudents) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalEnrolledStudents > 0 ? (completedCount / totalEnrolledStudents) * 100 : 0}%`, background: '#8b5cf6', borderRadius: 99 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Non-Attended</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {nonAttendedCount} / {totalEnrolledStudents} ({totalEnrolledStudents > 0 ? Math.round((nonAttendedCount / totalEnrolledStudents) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${totalEnrolledStudents > 0 ? (nonAttendedCount / totalEnrolledStudents) * 100 : 0}%`, background: '#ef4444', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Individual Student Performance & Grade Table ── */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Student Performance &amp; Grades ({filteredStudents.length})
          </h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search student…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={searchInputStyle}
              />
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL', 'SUBMITTED', 'PASSED', 'FAILED', 'IN_PROGRESS'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    background: statusFilter === st ? 'var(--text-primary)' : 'transparent',
                    color: statusFilter === st ? 'var(--lms-background)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st === 'ALL' ? 'All' : st === 'SUBMITTED' ? 'Completed' : st === 'PASSED' ? 'Passed' : st === 'FAILED' ? 'Failed' : 'In Progress'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 12 }}>
                <th style={{ padding: '10px 12px' }}>Student</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Grade</th>
                <th style={{ padding: '10px 12px' }}>Marks Obtained</th>
                <th style={{ padding: '10px 12px' }}>Completion %</th>
                <th style={{ padding: '10px 12px' }}>Attempts</th>
                <th style={{ padding: '10px 12px' }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No student performance records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.studentName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.studentEmail}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: s.passed ? '#ecfdf5' : '#fef2f2',
                          color: s.passed ? '#047857' : '#b91c1c',
                          border: `1px solid ${s.passed ? '#10b981' : '#ef4444'}`,
                        }}
                      >
                        {s.gradeLetter} ({s.passed ? 'PASS' : 'FAIL'})
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s.score ?? 0} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>/ {s.totalMarks}</span>
                    </td>
                    <td style={{ padding: '12px', width: 160 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(s.completionPercentage || 0, 100)}%`,
                              background: s.completionPercentage >= 75 ? '#10b981' : s.completionPercentage >= 40 ? '#f59e0b' : '#3b82f6',
                              borderRadius: 99
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', width: 36, textAlign: 'right' }}>
                          {s.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{s.attemptsCount}</td>
                    <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {s.submittedAt ? formatDate(s.submittedAt) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ── Inline Helper Components & Styles ── */
function StatusBadge({ status }) {
  if (status === 'SUBMITTED' || status === 'COMPLETED') {
    return <Badge tone="success">Completed</Badge>;
  }
  if (status === 'IN_PROGRESS') {
    return <Badge tone="warning">In Progress</Badge>;
  }
  if (status === 'EXPIRED') {
    return <Badge tone="neutral">Expired</Badge>;
  }
  return <Badge tone="neutral">Non-Attended</Badge>;
}

const cardStyle = {
  background: 'var(--lms-card, #ffffff)',
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: 12,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8
};

const panelStyle = {
  background: 'var(--lms-card, #ffffff)',
  border: '1px solid var(--border-color, #e5e7eb)',
  borderRadius: 12,
  padding: 20
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-muted, #6b7280)'
};

const valueStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text-primary, #111827)',
  letterSpacing: '-0.5px'
};

const subtextStyle = {
  fontSize: 12,
  color: 'var(--text-muted, #6b7280)'
};

const iconBoxStyle = (bg, color) => ({
  width: 36,
  height: 36,
  borderRadius: 8,
  background: bg,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const searchInputStyle = {
  width: '100%',
  padding: '6px 12px 6px 30px',
  borderRadius: 8,
  border: '1px solid var(--border-color, #e5e7eb)',
  background: 'var(--bg-primary, #ffffff)',
  color: 'var(--text-primary, #111827)',
  fontSize: 13,
  outline: 'none'
};

export default AssessmentAnalyticsTab;
