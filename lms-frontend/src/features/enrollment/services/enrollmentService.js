import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const enrollmentService = {
  list: (params) => http.get(API_ENDPOINTS.enrollments.base, { params }),
  listMine: (params) => http.get(API_ENDPOINTS.enrollments.mine, { params }),
  getById: (id) => http.get(API_ENDPOINTS.enrollments.byId(id)),
  enroll: (payload) => http.post(API_ENDPOINTS.enrollments.base, payload),
  unenroll: (id) => http.delete(API_ENDPOINTS.enrollments.byId(id)),
};

export default enrollmentService;
