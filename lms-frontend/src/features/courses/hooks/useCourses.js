import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import courseService from '../services/courseService';
import { QUERY_KEYS } from '../../../constants/appConstants';

export const useCourses = (params = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.COURSES, params],
    queryFn: () => courseService.list(params),
    placeholderData: (previous) => previous,
  });

/**
 * Loads courses for student view:
 * 1. Tries /courses/mine (courses student is enrolled in)
 * 2. If empty or /mine not ready, falls back to all published courses in DB
 */
export const useMyCourses = (params = {}) =>
  useQuery({
    queryKey: [...QUERY_KEYS.COURSES, 'mine', params],
    queryFn: async () => {
      try {
        const res = await courseService.listMine(params);
        const items = res?.content ?? res?.data?.content ?? res?.data ?? res ?? [];
        if (Array.isArray(items) && items.length > 0) {
          return res;
        }
      } catch (err) {
        // Fall through to published courses fallback
      }

      // Seamless fallback: fetch published course catalog from DB
      try {
        const published = await courseService.list({ status: 'PUBLISHED', ...params });
        return published;
      } catch (err) {
        return [];
      }
    },
  });

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: courseService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES }),
  });
};

export const useUpdateCourse = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => courseService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COURSES }),
  });
};

export default useCourses;
