import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, Clock } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import LiveAttendanceTable from '../components/LiveAttendanceTable';
import { useLiveSessionDetails, useLiveSessionAttendance } from '../hooks/useLiveSession';

export const LiveAttendancePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const { data: session, isLoading: sessionLoading } = useLiveSessionDetails(sessionId);
  const { data: attendance = [], isLoading: attendanceLoading } = useLiveSessionAttendance(sessionId);

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateStr));
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
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
                  Session Attendance
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Official Roster
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {session ? session.title : 'Live Classroom Session'}
              </p>
            </div>
          </div>

          {session && (
            <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatTime(session.scheduledStart)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Status: <strong className="capitalize text-slate-700 dark:text-slate-300">{session.status?.toLowerCase()}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {sessionLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <LiveAttendanceTable
            attendanceList={attendance}
            isLoading={attendanceLoading}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default LiveAttendancePage;
