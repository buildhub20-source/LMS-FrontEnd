import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminAssessmentService from '../services/adminAssessmentService';
import { QUERY_KEYS } from '../../../constants/appConstants';

const ADMIN_ASSESSMENTS = [...QUERY_KEYS.ASSESSMENTS, 'admin'];

// ─── Assessment queries ───────────────────────────────────────────────────────

export const useAdminAssessments = (params = {}) =>
  useQuery({
    queryKey: [...ADMIN_ASSESSMENTS, params],
    queryFn: () => adminAssessmentService.list(params),
    placeholderData: (prev) => prev,
  });

export const useAdminAssessment = (id) =>
  useQuery({
    queryKey: [...ADMIN_ASSESSMENTS, id],
    queryFn: () => adminAssessmentService.getById(id),
    enabled: Boolean(id),
  });

export const useAdminAssessmentQuestions = (assessmentId) =>
  useQuery({
    queryKey: [...ADMIN_ASSESSMENTS, assessmentId, 'questions'],
    queryFn: () => adminAssessmentService.getQuestions(assessmentId),
    enabled: Boolean(assessmentId),
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

const invalidateAll = (qc) => qc.invalidateQueries({ queryKey: ADMIN_ASSESSMENTS });

export const useCreateAdminAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAssessmentService.create,
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateAdminAssessment = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.update(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteAdminAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAssessmentService.remove,
    onSuccess: () => invalidateAll(qc),
  });
};

// Lifecycle
const lifecycleMutation = (fn) => () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => invalidateAll(qc) });
};

export const usePublishAssessment = lifecycleMutation(adminAssessmentService.publish);
export const useUnpublishAssessment = lifecycleMutation(adminAssessmentService.unpublish);
export const useCloseAssessment = lifecycleMutation(adminAssessmentService.close);
export const useArchiveAssessment = lifecycleMutation(adminAssessmentService.archive);

// Questions
export const useAddQuestion = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.addQuestion(assessmentId, payload),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useUpdateQuestion = (questionId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.updateQuestion(questionId, payload),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useRemoveQuestion = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId) => adminAssessmentService.removeQuestion(assessmentId, questionId),
    onSuccess: () => invalidateAll(qc),
  });
};
