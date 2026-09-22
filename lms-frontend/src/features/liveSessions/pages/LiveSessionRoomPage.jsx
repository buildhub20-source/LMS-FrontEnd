import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Spinner from '../../../components/common/Spinner';
import Button from '../../../components/common/Button';
import LiveRoom from '../components/LiveRoom';
import { useLiveSessionDetails, useEndLiveSession } from '../hooks/useLiveSession';
import liveSessionApi from '../api/liveSessionApi';
import useAuth from '../../auth/hooks/useAuth';
import { ROUTES } from '../../../constants/routes';
import { getPrimaryRole, ROLES } from '../../../constants/roles';

export const LiveSessionRoomPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: session, isLoading: sessionLoading, error: sessionError } = useLiveSessionDetails(sessionId);
  const endMutation = useEndLiveSession();

  const [joinData, setJoinData] = useState(null);
  const [isJoining, setIsJoining] = useState(true);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const join = async () => {
      try {
        setIsJoining(true);
        setJoinError(null);
        const res = await liveSessionApi.joinSession(sessionId);
        const payload = res?.data ?? res;
        if (isMounted) {
          setJoinData(payload);
          setIsJoining(false);
        }
      } catch (err) {
        if (isMounted) {
          setJoinError(err?.response?.data?.message || 'Failed to join the live classroom session.');
          setIsJoining(false);
        }
      }
    };

    join();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleLeave = () => {
    const roles = user?.roles ?? (user?.role ? [user.role] : []);
    const primaryRole = getPrimaryRole(roles);
    const destination =
      primaryRole === ROLES.ADMIN || primaryRole === ROLES.SUPER_ADMIN
        ? ROUTES.ADMIN_LIVE_CLASSES
        : primaryRole === ROLES.INSTRUCTOR
          ? ROUTES.INSTRUCTOR_LIVE_CLASSES
          : primaryRole === ROLES.STUDENT
            ? ROUTES.STUDENT_LIVE_CLASSES
            : session?.courseId
              ? ROUTES.COURSE_LIVE_SESSIONS(session.courseId)
              : ROUTES.PROFILE;

    navigate(destination, { replace: true });
  };

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this live class for all participants?')) {
      await endMutation.mutateAsync(sessionId);
      handleLeave();
    }
  };

  if (sessionLoading || isJoining) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-slate-400 animate-pulse">
          Connecting to secure LiveKit classroom...
        </p>
      </div>
    );
  }

  if (joinError || sessionError) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Classroom Access Error</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            {joinError || sessionError?.message || 'Unable to join session.'}
          </p>
          <Button variant="primary" onClick={handleLeave} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <LiveRoom
      sessionId={sessionId}
      serverUrl={joinData?.serverUrl || 'wss://livekit.local'}
      token={joinData?.token}
      roomName={session?.title || joinData?.roomName || 'Live Classroom'}
      participantName={joinData?.participantName || user?.name || 'Student'}
      participantIdentity={joinData?.participantIdentity || user?.id || 'guest-participant'}
      isInstructor={joinData?.isPublisher || false}
      onLeave={handleLeave}
      onEndSession={handleEndSession}
    />
  );
};

export default LiveSessionRoomPage;
