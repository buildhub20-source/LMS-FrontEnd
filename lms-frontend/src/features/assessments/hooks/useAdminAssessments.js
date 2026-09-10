import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminAssessmentService from '../services/adminAssessmentService';
import { QUERY_KEYS } from '../../../constants/appConstants';

export const adminAssessmentKeys = {
  all: [...QUERY_KEYS.ASSESSMENTS, 'admin'],
  lists: () => [...adminAssessmentKeys.all, 'list'],
  list: (params) => [...adminAssessmentKeys.lists(), params],
  details: () => [...adminAssessmentKeys.all, 'detail'],
  detail: (id) => [...adminAssessmentKeys.details(), id],
  questions: (id) => [...adminAssessmentKeys.detail(id), 'questions'],
  analytics: (id) => [...adminAssessmentKeys.detail(id), 'analytics'],
};

// ─── Assessment queries ───────────────────────────────────────────────────────

export const useAdminAssessments = (params = {}) =>
  useQuery({
    queryKey: adminAssessmentKeys.list(params),
    queryFn: () => adminAssessmentService.list(params),
    placeholderData: (prev) => prev,
  });

export const useAdminAssessment = (id) =>
  useQuery({
    queryKey: adminAssessmentKeys.detail(id),
    queryFn: () => adminAssessmentService.getById(id),
    enabled: Boolean(id),
  });

export const useAdminAssessmentQuestions = (assessmentId) =>
  useQuery({
    queryKey: adminAssessmentKeys.questions(assessmentId),
    queryFn: () => adminAssessmentService.getQuestions(assessmentId),
    enabled: Boolean(assessmentId),
  });

export const useAdminAssessmentAnalytics = (assessmentId) =>
  useQuery({
    queryKey: adminAssessmentKeys.analytics(assessmentId),
    queryFn: () => adminAssessmentService.getAnalytics(assessmentId),
    enabled: Boolean(assessmentId),
  });

// ─── Mutations ────────────────────────────────────────────────────────────────

const invalidateLists = (qc) => qc.invalidateQueries({ queryKey: adminAssessmentKeys.lists() });
const refreshDetail = (qc, id, assessment) => {
  if (!id) return;
  if (assessment?.id) qc.setQueryData(adminAssessmentKeys.detail(id), assessment);
  else qc.invalidateQueries({ queryKey: adminAssessmentKeys.detail(id) });
};

export const useCreateAdminAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAssessmentService.create,
    onSuccess: () => invalidateLists(qc),
  });
};

export const useUpdateAdminAssessment = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.update(id, payload),
    onSuccess: (assessment) => {
      refreshDetail(qc, id, assessment);
      invalidateLists(qc);
    },
  });
};

export const useDeleteAdminAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAssessmentService.remove,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: adminAssessmentKeys.detail(id) });
      invalidateLists(qc);
    },
  });
};

// Lifecycle. Keeping the hook itself named makes hook ordering visible to the
// rules-of-hooks linter and prevents accidental conditional hook calls.
const useAssessmentLifecycleMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (assessment, id) => {
      refreshDetail(qc, id, assessment);
      invalidateLists(qc);
    },
  });
};

export const usePublishAssessment = () =>
  useAssessmentLifecycleMutation(adminAssessmentService.publish);
export const useUnpublishAssessment = () =>
  useAssessmentLifecycleMutation(adminAssessmentService.unpublish);
export const useCloseAssessment = () =>
  useAssessmentLifecycleMutation(adminAssessmentService.close);
export const useArchiveAssessment = () =>
  useAssessmentLifecycleMutation(adminAssessmentService.archive);

// Questions
export const useAddQuestion = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.addQuestion(assessmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminAssessmentKeys.questions(assessmentId) });
      refreshDetail(qc, assessmentId);
      invalidateLists(qc);
    },
  });
};

export const useUpdateQuestion = (questionId, assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminAssessmentService.updateQuestion(questionId, payload),
    onSuccess: () => {
      if (assessmentId) {
        qc.invalidateQueries({ queryKey: adminAssessmentKeys.questions(assessmentId) });
        refreshDetail(qc, assessmentId);
      }
    },
  });
};

export const useRemoveQuestion = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionId) => adminAssessmentService.removeQuestion(assessmentId, questionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminAssessmentKeys.questions(assessmentId) });
      refreshDetail(qc, assessmentId);
      invalidateLists(qc);
    },
  });
};

// Retest
export const useRetestStudent = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId) => adminAssessmentService.retestStudent(assessmentId, studentId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: adminAssessmentKeys.analytics(assessmentId) }),
  });
};

// Result Analytics Visibility Toggle
export const useToggleResultAnalytics = (assessmentId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled) => adminAssessmentService.toggleResultAnalytics(assessmentId, enabled),
    onSuccess: (data) => {
      refreshDetail(qc, assessmentId, data);
      invalidateLists(qc);
    },
  });
};
