import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Spinner from '../../../components/common/Spinner';
import Alert from '../../../components/feedback/Alert';
import { liveSessionApi } from '../api/liveSessionApi';
import { downloadCsv, slug } from '../../../utils/csv';

const rateTone = (pct) =>
  pct >= 75
    ? 'var(--badge-success-fg)'
    : pct >= 50
      ? 'var(--badge-warning-fg)'
      : 'var(--badge-danger-fg)';

/**
 * Live-class attendance for a course: one row per enrolled student, built
 * from who actually joined each class that took place.
 */
export const CourseLiveAttendance = ({ courseId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['live-sessions', 'course-attendance', courseId],
    queryFn: () => liveSessionApi.getCourseAttendance(courseId),
    enabled: Boolean(courseId),
  });

  const handleExport = () => {
    downloadCsv(
      `attendance-${slug(data.courseTitle)}.csv`,
      ['Name', 'Email', 'Classes attended', 'Classes held', 'Attendance %', 'Minutes attended'],
      data.students.map((s) => [
        s.name,
        s.email,
        s.classesAttended,
        s.classesHeld,
        s.percentage,
        s.minutesAttended,
      ]),
    );
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Live class attendance</h3>
          <p className="text-sm text-muted-foreground">
            Who joined this course&apos;s live classes. Only classes that took place are counted.
          </p>
        </div>
        {data && data.students.length > 0 && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Alert tone="error">{error.message || 'Attendance could not be loaded.'}</Alert>
        </div>
      )}

      {data && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Attendance rate</div>
              <div className="text-xl font-semibold text-foreground">
                {data.classesHeld === 0 ? '—' : `${data.attendanceRate}%`}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Classes held</div>
              <div className="text-xl font-semibold text-foreground">{data.classesHeld}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Attended at least one</div>
              <div className="text-xl font-semibold text-foreground">
                {data.studentsAttendedAny} / {data.enrolledStudents}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Enrolled students</div>
              <div className="text-xl font-semibold text-foreground">{data.enrolledStudents}</div>
            </div>
          </div>

          {data.classesHeld === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No live class has taken place in this course yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Student</th>
                    <th className="py-2 pr-4 font-medium">Attended</th>
                    <th className="py-2 pr-4 font-medium">Attendance</th>
                    <th className="py-2 text-right font-medium">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.studentId} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-foreground">
                        {s.classesAttended} of {s.classesHeld}
                      </td>
                      <td
                        className="py-2 pr-4 font-semibold tabular-nums"
                        style={{ color: rateTone(s.percentage) }}
                      >
                        {s.percentage}%
                      </td>
                      <td className="py-2 text-right tabular-nums text-foreground">
                        {s.minutesAttended}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CourseLiveAttendance;
