import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const assessmentService = {
  list: (params) => http.get(API_ENDPOINTS.assessments.base, { params }),
  getById: (id) => http.get(API_ENDPOINTS.assessments.byId(id)),
  startAttempt: (id) => http.post(API_ENDPOINTS.assessments.attempts(id)),
  saveSubmissionDraft: (attemptId, questionId, language, sourceCode) =>
    http.post(API_ENDPOINTS.assessments.saveDraft(attemptId), { questionId, language, sourceCode }),
  submitAttempt: (attemptId) =>
    http.post(API_ENDPOINTS.assessments.submit(attemptId)),
  getResult: (attemptId) => http.get(API_ENDPOINTS.assessments.result(attemptId)),
  getAttemptHistory: (assessmentId) => http.get(API_ENDPOINTS.assessments.attemptsHistory(assessmentId)),
  getReport: (attemptId) => http.get(API_ENDPOINTS.assessments.report(attemptId)),
};

export default assessmentService;
