import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import liveSessionApi from '../api/liveSessionApi';
import { useToast } from '../../../components/feedback/Toast';

export const useCourseLiveSessions = (courseId) => {
  return useQuery({
    queryKey: ['course-live-sessions', courseId],
    queryFn: async () => {
      const res = await liveSessionApi.getCourseSessions(courseId);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    enabled: Boolean(courseId),
    refetchInterval: 15000, // periodically refresh live status
  });
};

export const useAllLiveSessions = (filters = {}) => {
  return useQuery({
    queryKey: ['all-live-sessions', filters],
    queryFn: async () => {
      const res = await liveSessionApi.getAllSessions(filters);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    refetchInterval: 15000,
  });
};

export const useLiveSessionDetails = (sessionId) => {
  return useQuery({
    queryKey: ['live-session', sessionId],
    queryFn: async () => {
      const res = await liveSessionApi.getSession(sessionId);
      return res?.data ?? res;
    },
    enabled: Boolean(sessionId),
  });
};

export const useLiveSessionAttendance = (sessionId) => {
  return useQuery({
    queryKey: ['live-session-attendance', sessionId],
    queryFn: async () => {
      const res = await liveSessionApi.getSessionAttendance(sessionId);
      return Array.isArray(res) ? res : (res?.data || []);
    },
    enabled: Boolean(sessionId),
    refetchInterval: 10000,
  });
};

export const useTenantLiveUsage = (tenantId) => {
  return useQuery({
    queryKey: ['tenant-live-usage', tenantId],
    queryFn: async () => {
      const res = await liveSessionApi.getTenantUsage(tenantId);
      return res?.data ?? res;
    },
    enabled: Boolean(tenantId),
  });
};

export const useCreateLiveSession = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ courseId, payload }) => liveSessionApi.createSession(courseId, payload),
    onSuccess: (_, { courseId }) => {
      toast.success('Live class session scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['course-live-sessions', courseId] });
      queryClient.invalidateQueries({ queryKey: ['all-live-sessions'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to schedule live session');
    },
  });
};

export const useStartLiveSession = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (sessionId) => {
      const res = await liveSessionApi.startSession(sessionId);
      return res?.data ?? res;
    },
    onSuccess: (_, sessionId) => {
      toast.success('Live class started!');
      queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['course-live-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['all-live-sessions'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to start live session');
    },
  });
};

export const useJoinLiveSession = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: async (sessionId) => {
      const res = await liveSessionApi.joinSession(sessionId);
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to join live session');
    },
  });
};

export const useEndLiveSession = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (sessionId) => liveSessionApi.endSession(sessionId),
    onSuccess: (_, sessionId) => {
      toast.success('Live class ended.');
      queryClient.invalidateQueries({ queryKey: ['live-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['course-live-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['all-live-sessions'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to end live session');
    },
  });
};
