import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

const ep = API_ENDPOINTS.adminAssessments;

export const adminAssessmentService = {
  // Assessment CRUD
  list: (params) => http.get(ep.base, { params }),
  getById: (id) => http.get(ep.byId(id)),
  create: (payload) => http.post(ep.base, payload),
  update: (id, payload) => http.put(ep.byId(id), payload),
  remove: (id) => http.delete(ep.byId(id)),

  // Lifecycle
  publish: (id) => http.post(ep.publish(id)),
  unpublish: (id) => http.post(ep.unpublish(id)),
  close: (id) => http.post(ep.close(id)),
  archive: (id) => http.post(ep.archive(id)),

  // Questions
  getQuestions: (assessmentId) => http.get(ep.questions(assessmentId)),
  addQuestion: (assessmentId, payload) => http.post(ep.questions(assessmentId), payload),
  updateQuestion: (questionId, payload) => http.put(ep.updateQuestion(questionId), payload),
  removeQuestion: (assessmentId, questionId) =>
    http.delete(ep.questionById(assessmentId, questionId)),
};

export default adminAssessmentService;
