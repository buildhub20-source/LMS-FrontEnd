import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const assessmentService = {
  list: (params) => http.get(API_ENDPOINTS.assessments.base, { params }),
  getById: (id) => http.get(API_ENDPOINTS.assessments.byId(id)),
  create: (payload) => http.post(API_ENDPOINTS.assessments.base, payload),
  update: (id, payload) => http.put(API_ENDPOINTS.assessments.byId(id), payload),
  startAttempt: (id) => http.post(API_ENDPOINTS.assessments.attempts(id)),
  submitAttempt: (attemptId, answers) =>
    http.post(API_ENDPOINTS.assessments.submit(attemptId), { answers }),
  getResult: (attemptId) => http.get(API_ENDPOINTS.assessments.result(attemptId)),
};

export default assessmentService;
