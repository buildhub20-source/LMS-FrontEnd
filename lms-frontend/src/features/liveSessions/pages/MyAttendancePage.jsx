import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Clock, Percent, Video } from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import Spinner from '../../../components/common/Spinner';
import Badge from '../../../components/common/Badge';
import Alert from '../../../components/feedback/Alert';
import { liveSessionApi } from '../api/liveSessionApi';

const formatDate = (iso) =>
  iso
    ? new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(iso))
    : '—';

const Stat = ({ icon, label, value, hint }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      {icon}
      {label}
    </div>
    <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
    {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
  </div>
);

/** A student's own live-class attendance across the courses they are enrolled in. */
export const MyAttendancePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['live-sessions', 'my-attendance'],
    queryFn: liveSessionApi.getMyAttendance,
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My attendance</h1>
          <p className="text-sm text-muted-foreground">
            Live classes in your courses, and whether you joined them.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        )}

        {error && (
          <Alert tone="error">
            {error.message || 'Your attendance could not be loaded. Try again shortly.'}
          </Alert>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat
                icon={<Percent className="h-4 w-4" aria-hidden="true" />}
                label="Attendance"
                value={`${data.percentage}%`}
                hint={`${data.classesAttended} of ${data.classesHeld} classes`}
              />
              <Stat
                icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
                label="Classes attended"
                value={data.classesAttended}
              />
              <Stat
                icon={<Video className="h-4 w-4" aria-hidden="true" />}
                label="Classes held"
                value={data.classesHeld}
              />
              <Stat
                icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                label="Time in class"
                value={
                  data.minutesAttended >= 60
                    ? `${Math.floor(data.minutesAttended / 60)} h ${data.minutesAttended % 60} min`
                    : `${data.minutesAttended} min`
                }
              />
            </div>

            {data.classes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
                <h2 className="font-semibold text-foreground">No live classes yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once a live class in one of your courses has taken place, it shows up here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Course</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.classes.map((c) => (
                      <tr key={c.sessionId} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{c.courseTitle || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(c.scheduledStart)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={c.attended ? 'success' : 'danger'}>
                            {c.attended ? 'Attended' : 'Missed'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">
                          {c.attended ? c.minutesAttended : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default MyAttendancePage;
