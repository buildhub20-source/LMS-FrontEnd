import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Award, Search, ArrowRight, RotateCcw,
  PlayCircle, RefreshCcw, CheckCircle2, Filter,
  Code2, Shield, Calendar, AlertCircle, BookOpen,
  TrendingUp, Sparkles, CheckCircle
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import EmptyState from '../../../components/common/EmptyState';
import { AttemptStatusBadge } from '../components/AttemptStatusBadge';
import { DeadlineCountdown } from '../components/DeadlineCountdown';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';
import { ATTEMPT_STATUS } from '../constants/assessmentConstants';

/**
 * Executive Student Assessment Portal
 *
 * Features:
 * - KPI Metrics Overview (Total, In Progress, Completed, Average Score)
 * - Enhanced Search & Filter Navigation
 * - Rich Assessment Cards with topics, duration, weightage, attempts, and anti-cheat tags
 * - Seamless Launch into Pre-Flight Lockdown Onboarding
 */
export const AssessmentListPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [attemptMap, setAttemptMap] = useState({}); // assessmentId -> latest attempt info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assessmentService.list();
      const items = res?.content ?? res?.data?.data?.content ?? res?.data?.content ?? (Array.isArray(res) ? res : []);
      setAssessments(items);

      // Fetch attempt history for each assessment to determine status
      const historyResults = await Promise.allSettled(
        items.map((a) =>
          assessmentService.getAttemptHistory(a.id).then((r) => ({
            assessmentId: a.id,
            history: Array.isArray(r) ? r : (r?.data?.data ?? r?.data ?? []),
          })),
        ),
      );

      const map = {};
      historyResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { assessmentId, history } = result.value;
          if (history.length > 0) {
            const latest = [...history].sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
            map[assessmentId] = {
              status: latest.status,
              attemptNumber: latest.attemptNumber,
              attemptsUsed: history.length,
              attemptId: latest.attemptId || latest.id,
              score: latest.score ?? latest.obtainedMarks,
              totalMarks: latest.totalMarks,
              percentage: latest.percentage,
            };
          } else {
            map[assessmentId] = { status: 'NOT_STARTED', attemptsUsed: 0 };
          }
        }
      });
      setAttemptMap(map);
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getAttemptInfo = (id) => attemptMap[id] ?? { status: 'NOT_STARTED', attemptsUsed: 0 };

  // Calculate high-level stats
  const totalCount = assessments.length;
  const inProgressCount = assessments.filter((a) => getAttemptInfo(a.id).status === ATTEMPT_STATUS.IN_PROGRESS).length;
  const completedCount = assessments.filter((a) => {
    const s = getAttemptInfo(a.id).status;
    return s === ATTEMPT_STATUS.SUBMITTED || s === ATTEMPT_STATUS.TIMED_OUT || s === ATTEMPT_STATUS.EVALUATED;
  }).length;
  const pendingCount = totalCount - inProgressCount - completedCount;

  const filters = [
    { value: 'ALL', label: 'All Assessments', count: totalCount },
    { value: 'NOT_STARTED', label: 'Not Started', count: pendingCount },
    { value: ATTEMPT_STATUS.IN_PROGRESS, label: 'In Progress', count: inProgressCount },
    { value: ATTEMPT_STATUS.SUBMITTED, label: 'Completed', count: completedCount },
  ];

  const filtered = assessments.filter((a) => {
    const matchSearch =
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (statusFilter === 'ALL') return true;
    const status = getAttemptInfo(a.id).status;
    if (statusFilter === ATTEMPT_STATUS.SUBMITTED) {
      return status === ATTEMPT_STATUS.SUBMITTED || status === ATTEMPT_STATUS.TIMED_OUT || status === ATTEMPT_STATUS.EVALUATED;
    }
    return status === statusFilter;
  });

  const handleAction = (assessment) => {
    const info = getAttemptInfo(assessment.id);
    if (info.status === ATTEMPT_STATUS.IN_PROGRESS) {
      navigate(ROUTES.ASSESSMENT_ATTEMPT(assessment.id));
    } else if (info.status === ATTEMPT_STATUS.SUBMITTED || info.status === ATTEMPT_STATUS.TIMED_OUT || info.status === ATTEMPT_STATUS.EVALUATED) {
      navigate(ROUTES.ASSESSMENT_RESULT(info.attemptId));
    } else {
      navigate(ROUTES.ASSESSMENT_ATTEMPT(assessment.id));
    }
  };

  const getActionButton = (assessment) => {
    const info = getAttemptInfo(assessment.id);
    const exhausted = info.attemptsUsed >= (assessment.maxAttempts || 1);

    if (info.status === ATTEMPT_STATUS.IN_PROGRESS) {
      return (
        <Button
          variant="primary"
          onClick={() => handleAction(assessment)}
          iconRight={<ArrowRight size={15} />}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            padding: '9px 20px',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}
        >
          Resume Test
        </Button>
      );
    }
    if (info.status === ATTEMPT_STATUS.SUBMITTED || info.status === ATTEMPT_STATUS.TIMED_OUT || info.status === ATTEMPT_STATUS.EVALUATED) {
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.ASSESSMENT_RESULT(info.attemptId))}
            iconLeft={<CheckCircle2 size={14} style={{ color: '#10b981' }} />}
            style={{
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            View Results
          </Button>
          {!exhausted && (
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.ASSESSMENT_ATTEMPT(assessment.id))}
              iconLeft={<RefreshCcw size={14} />}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              Retake ({info.attemptsUsed}/{assessment.maxAttempts})
            </Button>
          )}
        </div>
      );
    }
    return (
      <Button
        variant="primary"
        onClick={() => handleAction(assessment)}
        iconRight={<PlayCircle size={15} />}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '9px 24px',
          fontSize: 13,
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
        }}
      >
        Start Assessment
      </Button>
    );
  };

  return (
    <PageContainer
      title="Assessments"
      subtitle="Timed evaluations and coding challenges assigned to you."
    >
      {/* ── 1. TOP KPI DASHBOARD BANNER ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(15,23,42,0.6) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(99,102,241,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <BookOpen size={20} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Total Assigned</span>
            <strong style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</strong>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(15,23,42,0.6) 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(245,158,11,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>In Progress</span>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24' }}>{inProgressCount}</strong>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(15,23,42,0.6) 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(16,185,129,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Completed</span>
            <strong style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>{completedCount}</strong>
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.6) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(59,130,246,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Anti-Cheat</span>
            <strong style={{ fontSize: 13, fontWeight: 700, color: '#93c5fd' }}>Cloudflare R2 Proctor</strong>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER CONTROLS ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 440 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by assessment title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '7px 14px',
                borderRadius: 20,
                border: '1.5px solid',
                borderColor: statusFilter === f.value ? '#6366f1' : 'var(--border-color)',
                background: statusFilter === f.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                color: statusFilter === f.value ? '#818cf8' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{f.label}</span>
              <span
                style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: statusFilter === f.value ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. ASSESSMENTS GRID ── */}
      {loading ? (
        <Spinner fullPage={false} />
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="No published assessments match your current filter criteria."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filtered.map((item) => {
            const info = getAttemptInfo(item.id);
            const hasDeadline = Boolean(item.endTime);
            const isInProgress = info.status === ATTEMPT_STATUS.IN_PROGRESS;
            const isCompleted = info.status === ATTEMPT_STATUS.SUBMITTED || info.status === ATTEMPT_STATUS.TIMED_OUT || info.status === ATTEMPT_STATUS.EVALUATED;
            const used = info.attemptsUsed ?? 0;
            const maxAttempts = item.maxAttempts || 1;
            const attemptsPct = Math.min(100, (used / maxAttempts) * 100);

            return (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(180deg, var(--bg-primary) 0%, rgba(15,23,42,0.85) 100%)',
                  border: `1px solid ${isInProgress ? 'rgba(99,102,241,0.5)' : 'var(--border-color)'}`,
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: isInProgress
                    ? '0 10px 30px rgba(0,0,0,0.5), 0 0 25px rgba(99,102,241,0.2)'
                    : '0 4px 20px rgba(0,0,0,0.25)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = isInProgress ? 'rgba(99,102,241,0.5)' : 'var(--border-color)';
                }}
              >
                {/* Card Top Pill: Category & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#a5b4fc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Code2 size={13} /> Coding Assessment
                  </span>

                  {info.status === 'NOT_STARTED' ? (
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.25)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#34d399',
                      }}
                    >
                      ● Ready to Start
                    </span>
                  ) : (
                    <AttemptStatusBadge status={info.status} size="sm" />
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {item.description || 'Comprehensive evaluation covering algorithm design, data structures, and automated compilation.'}
                  </p>
                </div>

                {/* Detailed Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 8,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: 4, borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                      <Clock size={13} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
                      <strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>{item.durationMinutes} Mins</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: 4, borderRadius: 6, background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                      <Award size={13} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Weightage</span>
                      <strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>{item.totalMarks} Marks</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: 4, borderRadius: 6, background: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                      <RotateCcw size={13} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Attempts</span>
                      <strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                        {used >= maxAttempts ? `${maxAttempts}/${maxAttempts} (Max)` : `${used}/${maxAttempts} Used`}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ padding: 4, borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                      <Shield size={13} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Anti-Cheat</span>
                      <strong style={{ fontSize: 12, color: '#34d399' }}>Proctored</strong>
                    </div>
                  </div>
                </div>

                {/* Deadline Indicator */}
                {hasDeadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={12} style={{ color: '#94a3b8' }} />
                    <DeadlineCountdown deadline={item.endTime} />
                  </div>
                )}

                {/* Attempt Progress Meter */}
                {used > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Attempt Progress</span>
                      <span style={{ color: isInProgress ? '#818cf8' : used >= maxAttempts ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                        {isInProgress ? 'In Progress' : used >= maxAttempts ? `${maxAttempts} of ${maxAttempts} (Completed)` : `${used} of ${maxAttempts} Attempted`}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${attemptsPct}%`,
                          background: isInProgress ? '#6366f1' : used >= maxAttempts ? '#ef4444' : '#10b981',
                          borderRadius: 4,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Card Action Footer */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 'auto',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {isInProgress ? (
                      <span style={{ color: '#818cf8', fontWeight: 600 }}>Active session found</span>
                    ) : isCompleted ? (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>Evaluation saved</span>
                    ) : (
                      <span>Time-limited test</span>
                    )}
                  </div>
                  {getActionButton(item)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default AssessmentListPage;
