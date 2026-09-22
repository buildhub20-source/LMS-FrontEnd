import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Filter,
  Radio,
  Calendar,
  CheckCircle2,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  useAllLiveSessions,
  useCreateLiveSession,
  useStartLiveSession,
  useEndLiveSession,
} from '../hooks/useLiveSession';
import { useCourses } from '../../courses/hooks/useCourses';
import LiveSessionCard from '../components/LiveSessionCard';
import ScheduleLiveSessionModal from '../components/ScheduleLiveSessionModal';
import useAuth from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../constants/routes';

export const LiveClassesHubPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRole = user?.role || user?.roles?.[0] || 'STUDENT';
  const roleName = (typeof userRole === 'string' ? userRole : userRole?.name || '').toUpperCase();
  const isInstructorOrAdmin =
    roleName === 'INSTRUCTOR' ||
    roleName === 'ADMIN' ||
    roleName === 'SUPER_ADMIN' ||
    Boolean(user?.isInstructor) ||
    Boolean(user?.isAdmin);

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, LIVE, SCHEDULED, ENDED
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Queries & Mutations
  const { data: sessions = [], isLoading, refetch } = useAllLiveSessions({
    status: activeTab === 'ALL' ? undefined : activeTab,
    courseId: selectedCourseId || undefined,
  });

  const { data: coursesData } = useCourses({ size: 100 });
  const courses = Array.isArray(coursesData)
    ? coursesData
    : coursesData?.content || coursesData?.data || [];

  const createMutation = useCreateLiveSession();
  const startMutation = useStartLiveSession();
  const endMutation = useEndLiveSession();

  // Metrics computation
  const metrics = useMemo(() => {
    const liveCount = sessions.filter((s) => s.status === 'LIVE').length;
    const scheduledCount = sessions.filter((s) => s.status === 'SCHEDULED').length;
    const endedCount = sessions.filter((s) => s.status === 'ENDED').length;
    return { liveCount, scheduledCount, endedCount };
  }, [sessions]);

  // Client-side search filtering
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !searchQuery.trim() ||
        s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [sessions, searchQuery]);

  const handleStartSession = async (sessionId) => {
    try {
      await startMutation.mutateAsync(sessionId);
      navigate(ROUTES.LIVE_SESSION_ROOM(sessionId));
    } catch (err) {
      console.error('Failed to start session', err);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to end this live session for all attendees?')) return;
    try {
      await endMutation.mutateAsync(sessionId);
      refetch();
    } catch (err) {
      console.error('Failed to end session', err);
    }
  };

  const handleSchedule = async ({ courseId, title, description, scheduledStart, scheduledEnd }) => {
    const targetCourseId = courseId || selectedCourseId || courses[0]?.id;
    if (!targetCourseId) {
      alert('Please select a course to schedule this live class for.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        courseId: targetCourseId,
        payload: { title, description, scheduledStart, scheduledEnd },
      });
      setIsScheduleModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to schedule session', err);
    }
  };

  return (
    <div
      style={{
        padding: '32px 36px',
        maxWidth: 1400,
        margin: '0 auto',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Banner & Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}
            >
              <Video size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  Live Classroom Hub
                </h1>
                {metrics.liveCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 10px',
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 8px #ef4444',
                      }}
                    />
                    {metrics.liveCount} CLASS ACTIVE NOW
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                Real-time interactive video lectures, collaborative whiteboards, and automatic attendance tracking.
              </p>
            </div>
          </div>

          {isInstructorOrAdmin && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)';
              }}
            >
              <Plus size={17} /> Schedule Live Class
            </button>
          )}
        </div>

        {/* Metrics Telemetry Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 8,
          }}
        >
          <div
            onClick={() => setActiveTab('LIVE')}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: activeTab === 'LIVE' ? 'rgba(239,68,68,0.12)' : 'var(--surface-medium)',
              border: `1px solid ${activeTab === 'LIVE' ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(239,68,68,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <Radio size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {metrics.liveCount}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Broadcasting Now</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('SCHEDULED')}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: activeTab === 'SCHEDULED' ? 'rgba(99,102,241,0.12)' : 'var(--surface-medium)',
              border: `1px solid ${activeTab === 'SCHEDULED' ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {metrics.scheduledCount}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Scheduled Upcoming</p>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('ENDED')}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: activeTab === 'ENDED' ? 'rgba(16,185,129,0.12)' : 'var(--surface-medium)',
              border: `1px solid ${activeTab === 'ENDED' ? 'rgba(16,185,129,0.4)' : 'var(--border-color)'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(16,185,129,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                {metrics.endedCount}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Completed Archives</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '16px 20px',
          borderRadius: 16,
          background: 'var(--surface-medium)',
          border: '1px solid var(--border-color)',
          marginBottom: 24,
        }}
      >
        {/* Status Pill Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'LIVE', label: '🔴 Live Now' },
            { id: 'SCHEDULED', label: 'Upcoming' },
            { id: 'ENDED', label: 'Completed' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? '#6366f1' : 'transparent',
                  color: active ? '#ffffff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Course selector & Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {courses.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '8px 32px 8px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  background: 'var(--surface-dark)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <Filter
                size={13}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)',
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative', minWidth: 220 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search live classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 10,
                fontSize: 13,
                background: 'var(--surface-dark)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div
          style={{
            padding: 64,
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3" />
          <p>Loading live classrooms...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            borderRadius: 20,
            background: 'var(--surface-medium)',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(99,102,241,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Video size={28} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              No live classes found
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)', maxWidth: 440 }}>
              {searchQuery || selectedCourseId || activeTab !== 'ALL'
                ? 'Try adjusting your search query or filters above.'
                : isInstructorOrAdmin
                ? 'No classes have been scheduled yet. Click "Schedule Live Class" above to set up your first interactive lecture.'
                : 'Your instructors have not scheduled any upcoming live classes yet. Check back soon!'}
            </p>
          </div>
          {isInstructorOrAdmin && !searchQuery && activeTab === 'ALL' && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              style={{
                marginTop: 6,
                padding: '9px 18px',
                borderRadius: 10,
                background: '#6366f1',
                color: '#fff',
                fontWeight: 600,
                fontSize: 13,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Schedule First Class
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {filteredSessions.map((session) => (
            <div key={session.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {session.courseTitle && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#818cf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: 6,
                    paddingLeft: 4,
                  }}
                >
                  <BookOpen size={12} /> {session.courseTitle}
                </div>
              )}
              <LiveSessionCard
                session={session}
                isInstructor={isInstructorOrAdmin}
                onStart={handleStartSession}
                onEnd={handleEndSession}
              />
            </div>
          ))}
        </div>
      )}

      {/* Global Schedule Modal */}
      {isInstructorOrAdmin && (
        <ScheduleLiveSessionModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleSchedule}
          courses={courses}
          initialCourseId={selectedCourseId}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
};

export default LiveClassesHubPage;
