import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const learningService = {
  getCourse: (courseId) => http.get(API_ENDPOINTS.courses.byId(courseId)),
  getLesson: (courseId, lessonId) =>
    http.get(API_ENDPOINTS.learning.lesson(courseId, lessonId)).catch(() => null),
  getProgress: (courseId) =>
    http.get(API_ENDPOINTS.learning.progress(courseId)).catch(() => ({ percent: 0 })),
  saveProgress: (courseId, payload) =>
    http.post(API_ENDPOINTS.learning.progress(courseId), payload).catch(() => ({ success: true })),
};

export default learningService;
