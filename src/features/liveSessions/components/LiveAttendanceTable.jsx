import { Users, Clock, CheckCircle2 } from 'lucide-react';

export const LiveAttendanceTable = ({ attendanceList = [], isLoading }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(dateStr));
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const totalAttendees = attendanceList.length;
  const activeAttendees = attendanceList.filter((a) => !a.leftAt).length;
  const totalSeconds = attendanceList.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const avgMinutes = totalAttendees > 0 ? Math.round(totalSeconds / totalAttendees / 60) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Attendees</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalAttendees}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Currently In Room</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeAttendees}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Duration</p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{avgMinutes} mins</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student / Participant</th>
                <th className="px-5 py-3.5">Joined At</th>
                <th className="px-5 py-3.5">Left At</th>
                <th className="px-5 py-3.5">Attended Duration</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                    Loading attendance roster...
                  </td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-400 italic">
                    No attendance records found for this live class yet.
                  </td>
                </tr>
              ) : (
                attendanceList.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{record.userName || 'Student'}</p>
                        <p className="text-xs text-slate-400">{record.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {formatTime(record.joinedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-300 font-mono">
                      {formatTime(record.leftAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                      {formatDuration(record.durationSeconds)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {!record.leftAt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          Active In Class
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveAttendanceTable;
