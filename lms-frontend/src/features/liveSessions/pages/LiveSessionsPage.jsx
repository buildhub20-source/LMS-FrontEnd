import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Plus, Calendar, Filter } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';
import LiveSessionCard from '../components/LiveSessionCard';
import ScheduleLiveSessionModal from '../components/ScheduleLiveSessionModal';
import {
  useCourseLiveSessions,
  useCreateLiveSession,
  useStartLiveSession,
  useEndLiveSession,
} from '../hooks/useLiveSession';
import usePermission from '../../../hooks/usePermission';
import { PERMISSIONS } from '../../../constants/permissions';
import { ROLES } from '../../../constants/roles';
import useCourse from '../../courses/hooks/useCourse';
import { ROUTES } from '../../../constants/routes';

export const LiveSessionsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: sessions = [], isLoading: sessionsLoading } = useCourseLiveSessions(courseId);

  const createMutation = useCreateLiveSession();
  const startMutation = useStartLiveSession();
  const endMutation = useEndLiveSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'LIVE' | 'SCHEDULED' | 'ENDED'

  const { hasPermission, hasAnyRole } = usePermission();
  const isInstructorOrAdmin =
    hasPermission(PERMISSIONS.LIVE_SESSION_MANAGE) ||
    hasPermission(PERMISSIONS.COURSE_UPDATE) ||
    hasAnyRole([ROLES.INSTRUCTOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]);

  const handleSchedule = (payload) => {
    createMutation.mutate(
      { courseId, payload },
      {
        onSuccess: () => setIsModalOpen(false),
      }
    );
  };

  const handleStart = (sessionId) => {
    startMutation.mutate(sessionId, {
      onSuccess: () => {
        navigate(ROUTES.LIVE_SESSION_ROOM(sessionId));
      },
    });
  };

  const handleEnd = (sessionId) => {
    endMutation.mutate(sessionId);
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const activeLiveCount = sessions.filter((s) => s.status === 'LIVE').length;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Live Classes
                </h1>
                {activeLiveCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    {activeLiveCount} Live Now
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {course?.title ? `Course: ${course.title}` : 'Real-time interactive video sessions'}
              </p>
            </div>
          </div>

          {isInstructorOrAdmin && (
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Schedule Live Class
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
            {['ALL', 'LIVE', 'SCHEDULED', 'ENDED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filter === tab
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All Classes' : tab.toLowerCase()}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </span>
        </div>

        {/* Content list */}
        {sessionsLoading || courseLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              No live classes found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {filter !== 'ALL'
                ? `No sessions currently matching "${filter.toLowerCase()}".`
                : isInstructorOrAdmin
                ? 'Get started by scheduling your first live classroom lecture or Q&A.'
                : 'Your instructor has not scheduled any live classes for this course yet.'}
            </p>
            {isInstructorOrAdmin && (
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Schedule Class Now
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <LiveSessionCard
                key={session.id}
                session={session}
                isInstructor={isInstructorOrAdmin}
                onStart={handleStart}
                onEnd={handleEnd}
                isStarting={startMutation.isPending}
                isEnding={endMutation.isPending}
              />
            ))}
          </div>
        )}

        {/* Scheduling Modal */}
        <ScheduleLiveSessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSchedule={handleSchedule}
          isSubmitting={createMutation.isPending}
        />
      </div>
    </PageContainer>
  );
};

export default LiveSessionsPage;
