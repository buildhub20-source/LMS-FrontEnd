import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, TrendingUp, Award, Clock, Plus,
  ClipboardCheck, BarChart2, ArrowUpRight, Layers,
  FileText, GraduationCap, AlertCircle, CheckCircle2
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import StatsCard from '../components/StatsCard';
import EnrollmentChart from '../components/EnrollmentChart';
import CompletionChart from '../components/CompletionChart';
import ErrorState from '../../../components/common/ErrorState';
import Spinner from '../../../components/common/Spinner';
import analyticsService from '../services/analyticsService';
import { QUERY_KEYS } from '../../../constants/appConstants';
import { ROUTES } from '../../../constants/routes';

// ── Metric Card with Icon ──
const MetricCard = ({ icon: Icon, label, value, tone = 'blue', isLoading, suffix = '' }) => {
  const tones = {
    blue: { bg: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
    green: { bg: 'rgba(16, 185, 129, 0.08)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
    amber: { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
    purple: { bg: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' },
    rose: { bg: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)' },
  };
  const t = tones[tone] || tones.blue;

  return (
    <div style={{
      background: 'var(--lms-card)',
      border: `1px solid var(--border-color)`,
      borderRadius: 14,
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'box-shadow 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: t.bg, border: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.color, flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </p>
        {isLoading ? (
          <div style={{ width: 60, height: 28, borderRadius: 6, background: 'var(--border-color)', marginTop: 4, animation: 'pulse 1.5s infinite' }} />
        ) : (
          <p style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        )}
      </div>
    </div>
  );
};

// ── Quick Action Button ──
const QuickAction = ({ icon: Icon, label, to, tone = 'blue' }) => {
  const tones = {
    blue: { bg: 'rgba(59, 130, 246, 0.06)', hover: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' },
    green: { bg: 'rgba(16, 185, 129, 0.06)', hover: 'rgba(16, 185, 129, 0.12)', color: '#10b981' },
    purple: { bg: 'rgba(139, 92, 246, 0.06)', hover: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' },
    amber: { bg: 'rgba(245, 158, 11, 0.06)', hover: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' },
  };
  const t = tones[tone] || tones.blue;

  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 18px', borderRadius: 12,
      background: t.bg, border: `1px solid transparent`,
      textDecoration: 'none', color: 'var(--text-primary)',
      transition: 'all 0.15s ease', cursor: 'pointer',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = t.hover; e.currentTarget.style.borderColor = t.color; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = t.bg; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: t.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{label}</p>
      </div>
      <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
    </Link>
  );
};

// ── Section Card Wrapper ──
const SectionCard = ({ title, subtitle, icon: Icon, children, style = {} }) => (
  <div style={{
    background: 'var(--lms-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    ...style,
  }}>
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {Icon && <Icon size={18} style={{ color: 'var(--text-muted)' }} />}
      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
    </div>
    <div style={{ padding: '16px 20px' }}>
      {children}
    </div>
  </div>
);

export const InstructorAnalyticsPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.ANALYTICS, 'instructor'],
    queryFn: () => analyticsService.instructorOverview(),
  });

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const stats = data?.data?.data || data?.data || data || {};
  const courseCount = stats.courseCount ?? 0;
  const learnerCount = stats.learnerCount ?? 0;
  const avgCompletion = stats.averageCompletion ?? 0;
  const avgScore = stats.averageScore ?? 0;
  const pendingGrading = stats.pendingGradingCount ?? 0;
  const enrollmentTrend = stats.enrollmentTrend ?? [];
  const completionByCourse = stats.completionByCourse ?? [];
  const recentActivity = stats.recentActivity ?? [];
  const coursePerformance = stats.coursePerformance ?? [];

  return (
    <PageContainer
      title="Instructor Dashboard"
      subtitle="Welcome back! Here's how your courses are performing."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── 1. Top Metrics Grid ── */}
        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          <MetricCard icon={BookOpen} label="My Courses" value={courseCount} tone="blue" isLoading={isLoading} />
          <MetricCard icon={Users} label="Total Learners" value={learnerCount} tone="green" isLoading={isLoading} />
          <MetricCard icon={TrendingUp} label="Avg. Completion" value={avgCompletion} tone="purple" isLoading={isLoading} suffix="%" />
          <MetricCard icon={Award} label="Avg. Score" value={avgScore} tone="amber" isLoading={isLoading} suffix="%" />
          {pendingGrading > 0 && (
            <MetricCard icon={ClipboardCheck} label="Pending Grading" value={pendingGrading} tone="rose" isLoading={isLoading} />
          )}
        </div>

        {/* ── 2. Two-Column: Charts + Quick Actions ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 20,
          alignItems: 'start',
        }}>
          {/* Charts Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SectionCard title="Enrollment Trend" subtitle="New enrollments over time" icon={TrendingUp}>
              <EnrollmentChart data={enrollmentTrend} />
            </SectionCard>

            <SectionCard title="Completion by Course" subtitle="Student completion rates" icon={BarChart2}>
              <CompletionChart data={completionByCourse} />
            </SectionCard>

            {/* Course Performance Table */}
            {coursePerformance.length > 0 && (
              <SectionCard title="Course Performance" subtitle="Detailed metrics per course" icon={Layers}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={thStyle}>Course</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Enrolled</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Completed</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Avg Score</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coursePerformance.map((cp, i) => (
                        <tr key={cp.courseId || i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={tdStyle}>
                            <span style={{ fontWeight: 600 }}>{cp.title || `Course ${i + 1}`}</span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{cp.enrolled ?? 0}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{cp.completed ?? 0}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>{cp.avgScore ?? 0}%</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            {cp.rating ? `⭐ ${cp.rating.toFixed(1)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Actions */}
            <SectionCard title="Quick Actions" icon={Plus}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickAction icon={Plus} label="Create New Course" to={ROUTES.COURSE_CREATE} tone="blue" />
                <QuickAction icon={ClipboardCheck} label="Create Assessment" to={ROUTES.ASSESSMENT_CREATE} tone="green" />
                <QuickAction icon={Award} label="Grade Submissions" to={ROUTES.INSTRUCTOR_GRADING} tone="purple" />
                <QuickAction icon={Layers} label="Manage Rubrics" to={ROUTES.INSTRUCTOR_RUBRICS} tone="amber" />
              </div>
            </SectionCard>

            {/* Pending Actions */}
            {pendingGrading > 0 && (
              <SectionCard title="Pending Actions" icon={AlertCircle}>
                <Link to={ROUTES.INSTRUCTOR_GRADING} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: 'rgba(244, 63, 94, 0.06)',
                  border: '1px solid rgba(244, 63, 94, 0.15)',
                  textDecoration: 'none', color: 'var(--text-primary)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(244, 63, 94, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f43f5e', flexShrink: 0,
                  }}>
                    <ClipboardCheck size={16} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
                      {pendingGrading} submission{pendingGrading > 1 ? 's' : ''} awaiting grading
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                      Review and grade pending student work
                    </p>
                  </div>
                  <ArrowUpRight size={14} style={{ marginLeft: 'auto', color: '#f43f5e' }} />
                </Link>
              </SectionCard>
            )}

            {/* Recent Activity Feed */}
            <SectionCard title="Recent Activity" subtitle="Latest events across your courses" icon={Clock}>
              {recentActivity.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentActivity.slice(0, 8).map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '8px 0',
                      borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: item.type === 'enrollment' ? 'rgba(16, 185, 129, 0.1)'
                          : item.type === 'submission' ? 'rgba(59, 130, 246, 0.1)'
                          : 'rgba(139, 92, 246, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: item.type === 'enrollment' ? '#10b981'
                          : item.type === 'submission' ? '#3b82f6' : '#8b5cf6',
                      }}>
                        {item.type === 'enrollment' ? <Users size={13} />
                          : item.type === 'submission' ? <FileText size={13} />
                          : <CheckCircle2 size={13} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                          {item.message || item.description || 'Activity event'}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  No recent activity to display
                </p>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

// ── Table Styles ──
const thStyle = {
  padding: '10px 12px',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  textAlign: 'left',
};

const tdStyle = {
  padding: '12px',
  fontSize: 13,
  color: 'var(--text-primary)',
};

export default InstructorAnalyticsPage;
