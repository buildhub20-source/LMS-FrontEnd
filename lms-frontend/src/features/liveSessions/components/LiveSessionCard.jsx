import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Users, Play, StopCircle, ArrowRight, CheckCircle2, Film } from 'lucide-react';
import Button from '../../../components/common/Button';
import { ROUTES } from '../../../constants/routes';

export const LiveSessionCard = ({ session, isInstructor, onStart, onEnd, isStarting, isEnding }) => {
  const navigate = useNavigate();

  const isLive = session.status === 'LIVE';
  const isScheduled = session.status === 'SCHEDULED';
  const isEnded = session.status === 'ENDED';

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

  const handleJoinOrEnter = () => {
    navigate(ROUTES.LIVE_SESSION_ROOM(session.id));
  };

  const handleViewAttendance = () => {
    navigate(ROUTES.LIVE_SESSION_ATTENDANCE(session.id));
  };

  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
      isLive 
        ? 'bg-rose-500/5 border-rose-500/30 ring-1 ring-rose-500/20' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
              {session.title}
            </h3>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500 text-white animate-pulse shadow-sm shadow-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE NOW
              </span>
            )}
            {isScheduled && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Scheduled
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                Ended
              </span>
            )}
          </div>
          {session.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {session.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800/60 my-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatTime(session.scheduledStart)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Until {formatTime(session.scheduledEnd)}</span>
        </div>
        {session.instructorName && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Instructor: <strong className="font-medium text-slate-700 dark:text-slate-300">{session.instructorName}</strong></span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div>
          {isEnded && isInstructor && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAttendance}
              className="text-xs"
            >
              View Attendance
            </Button>
          )}
          {session.recordingUrl && (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Film className="w-3.5 h-3.5" />
              Watch Recording
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              {isInstructor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEnd(session.id)}
                  disabled={isEnding}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/40"
                >
                  <StopCircle className="w-3.5 h-3.5 mr-1" />
                  End Class
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleJoinOrEnter}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 text-xs font-medium"
              >
                <Video className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                {isInstructor ? 'Enter Classroom' : 'Join Classroom'}
              </Button>
            </>
          ) : isScheduled ? (
            isInstructor ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStart(session.id)}
                disabled={isStarting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Start Class Now
              </Button>
            ) : (
              <span className="text-xs text-slate-400 font-medium italic">
                Awaiting Instructor to Start
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionCard;
