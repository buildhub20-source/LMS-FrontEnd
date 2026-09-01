import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, XCircle, Clock, RotateCcw, FileText,
  ChevronDown, ChevronUp, Award, ArrowLeft, Video, Play, ExternalLink
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import ErrorState from '../../../components/common/ErrorState';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import { ScoreRing } from '../components/ScoreRing';
import { AttemptStatusBadge } from '../components/AttemptStatusBadge';
import { CodeViewer } from '../components/CodeViewer';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';

/**
 * Full assessment result report page.
 * Fixes the prop-name bug (was passing result={} but ResultSummary expected report={}).
 * Enhanced with: ScoreRing, CodeViewer per question, AttemptStatusBadge,
 * retake button, and collapsible question breakdowns.
 */
export const AssessmentResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const { data: raw, isLoading, error, refetch } = useQuery({
    queryKey: ['assessment-report', attemptId],
    queryFn: () => assessmentService.getReport(attemptId),
    enabled: Boolean(attemptId),
  });

  const [expandedQuestions, setExpandedQuestions] = useState({});

  const toggleQuestion = (id) =>
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));

  if (isLoading) return <Spinner fullPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  // Unwrap nested API response
  const report = raw?.data?.data ?? raw?.data ?? raw;

  if (!report) return (
    <PageContainer title="Assessment Result">
      <p style={{ color: 'var(--text-muted)' }}>No result data found.</p>
    </PageContainer>
  );

  const {
    assessmentTitle,
    assessmentId,
    status,
    finalScore,
    totalMarks,
    percentage,
    passed,
    retakePolicy,
    attemptsUsed,
    maxAttemptsAllowed,
    timeSpentSeconds,
    startedAt,
    submittedAt,
    recordingPlaybackUrl,
    recordingDurationSeconds,
    questionResults = [],
    attemptHistory = [],
  } = report;

  const minutesSpent = Math.floor((timeSpentSeconds ?? 0) / 60);
  const secondsSpent = (timeSpentSeconds ?? 0) % 60;
  const canRetake = attemptsUsed < maxAttemptsAllowed;

  const statCard = (label, value, icon, iconColor) => (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: 10,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <PageContainer
      title="Assessment Result"
      actions={
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.STUDENT_ASSESSMENTS)}
          iconLeft={<ArrowLeft size={14} />}
        >
          All Assessments
        </Button>
      }
    >
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Hero Banner ──────────────────────────────────────── */}
        <div style={{
          background: passed
            ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
            : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          color: '#ffffff',
          borderRadius: 16,
          padding: '28px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.15)',
        }}>
          {/* Score Ring */}
          <ScoreRing
            percentage={percentage ?? 0}
            size={110}
            strokeWidth={10}
            passed={passed}
          />

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span style={{ fontSize: 22, fontWeight: 800 }}>
                {passed ? 'Assessment Passed!' : 'Not Passed'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 15, opacity: 0.92, fontWeight: 600 }}>
              {assessmentTitle}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.75 }}>
              Score: {finalScore ?? 0} / {totalMarks} pts · Retake Policy: {retakePolicy}
            </p>
          </div>

          {/* Right side — retake button */}
          {canRetake && (
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => navigate(ROUTES.ASSESSMENT_ATTEMPT(assessmentId))}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1.5px solid rgba(255,255,255,0.5)',
                  color: '#ffffff',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <RotateCcw size={14} />
                Retake ({attemptsUsed}/{maxAttemptsAllowed})
              </button>
            </div>
          )}
        </div>

        {/* ── Stats Row ────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {statCard('Time Spent', `${minutesSpent}m ${secondsSpent}s`, <Clock size={20} />, '#6366f1')}
          {statCard('Attempts Used', `${attemptsUsed} / ${maxAttemptsAllowed}`, <RotateCcw size={20} />, '#8b5cf6')}
          {statCard('Questions', `${questionResults.length}`, <FileText size={20} />, '#0ea5e9')}
          {statCard('Status', <AttemptStatusBadge status={status} />, <Award size={20} />, '#f59e0b')}
        </div>

        {/* ── Proctoring Screen Recording Session (Cloudflare R2) ── */}
        {recordingPlaybackUrl && (
          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              overflow: 'hidden',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                  }}
                >
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Proctoring Screen Recording
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    Full session screen activity recorded &amp; stored securely on Cloudflare R2
                  </p>
                </div>
              </div>

              <a
                href={recordingPlaybackUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6366f1',
                  textDecoration: 'none',
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.1)',
                }}
              >
                <span>Open in New Tab</span>
                <ExternalLink size={13} />
              </a>
            </div>

            <div
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                background: '#0a0a14',
                border: '1px solid var(--border-color)',
              }}
            >
              <video
                src={recordingPlaybackUrl}
                controls
                playsInline
                style={{
                  width: '100%',
                  maxHeight: 450,
                  display: 'block',
                  background: '#000000',
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* ── Question Breakdown ───────────────────────────────── */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Question Breakdown &amp; Rubric
            </h3>
          </div>

          {questionResults.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--text-muted)', fontSize: 14 }}>
              No detailed results are available yet. Check back after grading.
            </div>
          ) : (
            questionResults.map((q, idx) => {
              const isExpanded = expandedQuestions[q.questionId];
              const scorePct = q.maxMarks > 0 ? Math.round((q.scoreEarned ?? 0) / q.maxMarks * 100) : 0;

              return (
                <div key={q.questionId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {/* Question header row (always visible) */}
                  <button
                    onClick={() => toggleQuestion(q.questionId)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Score indicator */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: scorePct >= 50 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: scorePct >= 50 ? '#22c55e' : '#ef4444',
                    }}>
                      {scorePct}%
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Q{idx + 1}. {q.questionTitle}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                        {q.questionType}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700,
                        color: (q.scoreEarned ?? 0) > 0 ? '#10b981' : '#ef4444',
                      }}>
                        {q.scoreEarned ?? 0} / {q.maxMarks} pts
                      </span>
                      <Badge tone={q.submissionStatus === 'ACCEPTED' ? 'success' : 'neutral'}>
                        {q.submissionStatus ?? '—'}
                      </Badge>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 20px 20px',
                      background: 'var(--surface-medium)',
                      borderTop: '1px solid var(--border-color)',
                    }}>
                      {/* Submitted code */}
                      {q.sourceCode && (
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Your Submission
                          </p>
                          <CodeViewer
                            sourceCode={q.sourceCode}
                            language={q.language ?? 'python'}
                            maxHeight={300}
                          />
                        </div>
                      )}

                      {/* Rubric evaluations */}
                      {q.rubricEvaluations?.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                            Rubric Evaluation
                          </p>
                          {q.rubricEvaluations.map((r, rIdx) => (
                            <div key={rIdx} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              padding: '8px 12px',
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 6,
                              marginBottom: 6,
                              gap: 10,
                            }}>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {r.criterionName}
                                </p>
                                {r.feedback && (
                                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                    {r.feedback}
                                  </p>
                                )}
                              </div>
                              <span style={{
                                fontSize: 13, fontWeight: 700, flexShrink: 0,
                                color: r.score >= r.maxPoints / 2 ? '#10b981' : '#f59e0b',
                              }}>
                                {r.score} / {r.maxPoints}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!q.sourceCode && !q.rubricEvaluations?.length && (
                        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                          No submission recorded for this question.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Attempt History ──────────────────────────────────── */}
        {attemptHistory.length > 0 && (
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Attempt History
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-medium)' }}>
                    {['#', 'Status', 'Score', '%', 'Started', 'Submitted'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attemptHistory.map((att) => (
                    <tr key={att.attemptId} style={{ borderTop: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>#{att.attemptNumber}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <AttemptStatusBadge status={att.status} size="sm" />
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {att.score ?? 0} / {att.totalMarks}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#6366f1' }}>
                        {att.percentage}%
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {att.startedAt ? new Date(att.startedAt).toLocaleString() : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {att.submittedAt ? new Date(att.submittedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default AssessmentResultPage;
