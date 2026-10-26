// Enrollment status is the same source used by the progress dashboard.
export const isCourseCompleted = (course) =>
  course.enrollmentStatus
    ? course.enrollmentStatus === 'COMPLETED'
    : (course.progressPercent ?? 0) >= 100;
export const isCourseInProgress = (course) =>
  course.enrollmentStatus ? course.enrollmentStatus === 'ACTIVE' : !isCourseCompleted(course);
export const studyDurationLabel = (seconds) => {
  if (!(seconds > 0)) return '0 min';
  if (seconds < 60) return '<1 min';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)}h`;
};
