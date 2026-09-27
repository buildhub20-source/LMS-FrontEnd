import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import courseService from '../../courses/services/courseService';

export const liveSessionApi = {
  getAllSessions: async (params = {}) => {
    if (params.courseId) {
      return liveSessionApi.getCourseSessions(params.courseId);
    }
    try {
      const res = await http.get(API_ENDPOINTS.liveSessions.all, { params });
      if (Array.isArray(res)) return res;
    } catch {
      // Backend may not have new endpoint loaded yet without a restart
    }
    try {
      let coursesRes;
      try {
        coursesRes = await courseService.list({ size: 50 });
      } catch {
        coursesRes = await courseService.listMine({ size: 50 });
      }
      const courses = Array.isArray(coursesRes)
        ? coursesRes
        : (coursesRes?.content || coursesRes?.data || []);
      const results = await Promise.all(
        courses.map((c) =>
          liveSessionApi.getCourseSessions(c.id).catch(() => [])
        )
      );
      const all = results.flat();
      all.sort((a, b) => new Date(b.scheduledStart || 0) - new Date(a.scheduledStart || 0));
      if (params.status && params.status !== 'ALL') {
        return all.filter((s) => s.status?.toUpperCase() === params.status?.toUpperCase());
      }
      return all;
    } catch {
      return [];
    }
  },

  getCourseSessions: (courseId) =>
    http.get(API_ENDPOINTS.liveSessions.byCourse(courseId)),

  createSession: (courseId, payload) =>
    http.post(API_ENDPOINTS.liveSessions.create(courseId), payload),

  getSession: (sessionId) =>
    http.get(API_ENDPOINTS.liveSessions.byId(sessionId)),

  startSession: (sessionId) =>
    http.post(API_ENDPOINTS.liveSessions.start(sessionId)),

  joinSession: (sessionId) =>
    http.post(API_ENDPOINTS.liveSessions.join(sessionId)),

  endSession: (sessionId) =>
    http.post(API_ENDPOINTS.liveSessions.end(sessionId)),

  getSessionAttendance: (sessionId) =>
    http.get(API_ENDPOINTS.liveSessions.attendance(sessionId)),

  getTenantUsage: (tenantId) =>
    http.get(API_ENDPOINTS.liveSessions.tenantUsage(tenantId)),

  updateTenantLiveConfig: (tenantId, payload) =>
    http.put(API_ENDPOINTS.liveSessions.tenantConfig(tenantId), payload),
};

export default liveSessionApi;
