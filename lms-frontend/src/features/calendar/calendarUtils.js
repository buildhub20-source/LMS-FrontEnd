import { ROUTES } from '../../constants/routes';

export const eventRoute = (event) => {
  if (event.isImported) return null;
  if (['ASSESSMENT_DEADLINE', 'ASSESSMENT_START'].includes(event.type)) {
    return ROUTES.STUDENT_ASSESSMENTS;
  }
  if (['COURSE_ENROLLED', 'COURSE_COMPLETED'].includes(event.type) && event.referenceId) {
    return ROUTES.LEARNING(event.referenceId);
  }
  return null;
};

export const eventsInMonth = (events, year, month) =>
  events
    .filter((event) => {
      const date = new Date(event.startTime);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
