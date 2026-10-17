import { http } from '../../../services/api/axiosInstance';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

const ep = API_ENDPOINTS.adminAssessments;

// AI grading runs the student's code against every test case; the backend allows 180s.
const AI_GRADING_TIMEOUT_MS = 200_000;

export const gradingService = {
  getPendingSubmissions: (params) => http.get(ep.pendingGrading, { params }),
  gradeAttemptSubmission: (attemptId, payload) => http.post(ep.gradeAttempt(attemptId), payload),
  requestAiSuggestion: (submissionId, rubricId) =>
    http.post(
      ep.aiSuggestion(submissionId),
      { rubricId: rubricId || null },
      { timeout: AI_GRADING_TIMEOUT_MS },
    ),
  getAiSuggestion: (submissionId) => http.get(ep.aiSuggestion(submissionId)),
};

export default gradingService;
