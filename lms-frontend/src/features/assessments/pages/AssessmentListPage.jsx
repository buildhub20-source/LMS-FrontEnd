import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, CheckCircle, Search, ArrowRight, PlayCircle, RotateCcw } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import EmptyState from '../../../components/common/EmptyState';
import assessmentService from '../services/assessmentService';
import { ROUTES } from '../../../constants/routes';

export const AssessmentListPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assessmentService.list();
      const items = res?.data?.data?.content || res?.data?.content || [];
      setAssessments(items);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = assessments.filter((a) =>
    a.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer
      title="Available Assessments"
      subtitle="Complete timed evaluations, quizzes, and coding assessments."
    >
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary, #ffffff)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {loading ? (
        <Spinner fullPage={false} />
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="There are currently no active published assessments matching your criteria."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--lms-card, #ffffff)',
                border: '1px solid var(--border-color)',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <Badge tone="success">Published</Badge>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Clock size={15} style={{ color: '#3b82f6' }} />
                    <span>{item.durationMinutes} mins</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Award size={15} style={{ color: '#f59e0b' }} />
                    <span>{item.totalMarks} Marks</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                    <RotateCcw size={15} style={{ color: '#8b5cf6' }} />
                    <span>{item.maxAttempts} max {item.maxAttempts === 1 ? 'attempt' : 'attempts'}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  onClick={() => navigate(ROUTES.ASSESSMENT_ATTEMPT(item.id))}
                  iconRight={<ArrowRight size={16} />}
                >
                  Take Assessment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default AssessmentListPage;
