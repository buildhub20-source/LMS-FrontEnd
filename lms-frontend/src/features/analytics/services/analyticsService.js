import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const analyticsService = {
  adminOverview: (params) => http.get(API_ENDPOINTS.analytics.admin, { params }),
  instructorOverview: (params) => http.get(API_ENDPOINTS.analytics.instructor, { params }),
  studentProgress: (params) => http.get(API_ENDPOINTS.analytics.studentProgress, { params }),
};

export default analyticsService;
