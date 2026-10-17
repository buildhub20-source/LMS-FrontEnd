import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

async function devFallback(fn, fallbackData) {
  if (import.meta.env.DEV) {
    try {
      return await fn();
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        console.warn('Backend offline. Falling back to mock dev analytics data.');
        return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
      }
      throw err;
    }
  }
  return fn();
}

export const analyticsService = {
  adminOverview: (params) =>
    devFallback(
      () => http.get(API_ENDPOINTS.analytics.admin, { params }),
      () => ({
        activeLearners: 1245,
        publishedCourses: 32,
        totalEnrollments: 4850,
        completionRate: 78.4,
        recentActivity: [
          { action: 'New invitation accepted', detail: 'Jane Doe accepted the invitation for ADMIN.', time: '2 mins ago', type: 'accept' },
          { action: 'User locked', detail: 'Bob Johnson was locked manually.', time: '1 hour ago', type: 'lock' },
          { action: 'Role updated', detail: 'John Smith assigned role INSTRUCTOR.', time: '4 hours ago', type: 'role' },
          { action: 'New invitation sent', detail: 'Sent to charlie@example.com for STUDENT.', time: '1 day ago', type: 'invite' },
        ],
      })
    ),

  instructorOverview: (params) => http.get(API_ENDPOINTS.analytics.instructor, { params }),
  studentProgress: (params) => http.get(API_ENDPOINTS.analytics.studentProgress, { params }),
};

export default analyticsService;
