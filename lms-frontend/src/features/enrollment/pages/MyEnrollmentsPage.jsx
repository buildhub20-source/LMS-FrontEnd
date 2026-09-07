import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Calendar, CheckCircle2, Clock,
  XCircle, ArrowRight, Search, AlertCircle,
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import EmptyState from '../../../components/common/EmptyState';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import enrollmentService from '../services/enrollmentService';
import { ROUTES } from '../../../constants/routes';

const STATUS_CONFIG = {
  ACTIVE: { tone: 'success', label: 'Active', icon: <CheckCircle2 size={14} /> },
  COMPLETED: { tone: 'neutral', label: 'Completed', icon: <CheckCircle2 size={14} /> },
  DROPPED: { tone: 'danger', label: 'Dropped', icon: <XCircle size={14} /> },
  PENDING: { tone: 'warning', label: 'Pending', icon: <Clock size={14} /> },
};

/**
 * Student — My Enrollments page.
 * Fetches from GET /enrollments/mine (authenticated student endpoint).
 * Displays enrollment cards with course name, status, progress, and enrolled date.
 */
export const MyEnrollmentsPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await enrollmentService.listMine();
        // Handle both paginated and array responses
        const items =
          res?.content ??
          res?.data?.content ??
          res?.data?.data ??
          res?.data ??
          (Array.isArray(res) ? res : []);
        setEnrollments(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load enrollments.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const filtered = enrollments.filter((e) =>
    (e.courseName ?? e.course?.title ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <PageContainer
      title="My Enrollments"
      subtitle="Courses you are currently enrolled in or have completed."
    >
      {/* Search */}
      <div style={{ marginBottom: 24, position: 'relative', maxWidth: 380 }}>
        <Search
          size={15}
          style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }}
        />
        <input
          type="text"
          placeholder="Search enrollments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 14px 9px 38px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {loading ? (
        <Spinner fullPage={false} />
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No enrollments found"
          description={
            enrollments.length === 0
              ? 'You are not enrolled in any courses yet. Browse courses to get started.'
              : 'No enrollments match your search.'
          }
          icon={<BookOpen size={40} style={{ color: '#6366f1' }} />}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((enrollment) => {
            const title =
              enrollment.courseName ??
              enrollment.course?.title ??
              'Course';
            const status = enrollment.status ?? 'ACTIVE';
            const statusCfg = STATUS_CONFIG[status] ?? {
              tone: 'neutral',
              label: status,
              icon: <AlertCircle size={14} />,
            };
            const enrolledAt = enrollment.enrolledAt ?? enrollment.createdAt;
            const progressPct = enrollment.progressPercentage ?? enrollment.progress ?? 0;

            return (
              <div
                key={enrollment.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                {/* Coloured top stripe based on status */}
                <div
                  style={{
                    height: 4,
                    background:
                      status === 'ACTIVE'
                        ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                        : status === 'COMPLETED'
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : status === 'DROPPED'
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : 'linear-gradient(90deg, #f59e0b, #d97706)',
                  }}
                />

                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    {/* Course icon + title */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                          background: 'rgba(99,102,241,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <BookOpen size={18} style={{ color: '#6366f1' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0, fontSize: 14, fontWeight: 700,
                            color: 'var(--text-primary)', lineHeight: 1.35,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {title}
                        </p>
                        {enrollment.instructorName && (
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                            {enrollment.instructorName}
                          </p>
                        )}
                      </div>
                    </div>

                    <Badge tone={statusCfg.tone}>{statusCfg.label}</Badge>
                  </div>

                  {/* Progress bar (only for ACTIVE) */}
                  {status === 'ACTIVE' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                          Progress
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>
                          {Math.round(progressPct)}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 6, background: 'var(--surface-medium)',
                          borderRadius: 3, overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, progressPct)}%`,
                            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: 3,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Enrolled date */}
                  {enrolledAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Calendar size={12} />
                      Enrolled {new Date(enrolledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  )}

                  {/* Action */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <Button
                      variant={status === 'ACTIVE' ? 'primary' : 'secondary'}
                      onClick={() =>
                        navigate(
                          enrollment.courseId
                            ? ROUTES.LEARNING(enrollment.courseId)
                            : ROUTES.MY_COURSES,
                        )
                      }
                      iconRight={<ArrowRight size={14} />}
                    >
                      {status === 'ACTIVE' ? 'Continue Learning' : 'View Course'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default MyEnrollmentsPage;
