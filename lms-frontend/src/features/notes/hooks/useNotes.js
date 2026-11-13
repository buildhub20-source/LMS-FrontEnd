import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/appConstants';
import { notesService, bookmarkService } from '../services/notesService';

// ─── Notes ───────────────────────────────────────────

export const useNotes = (params) =>
  useQuery({
    queryKey: [...QUERY_KEYS.NOTES, 'list', params],
    queryFn: () => notesService.list(params),
    staleTime: 30000,
    select: (res) => res?.data ?? res,
  });

export const useNotesByCourse = (courseId) =>
  useQuery({
    queryKey: [...QUERY_KEYS.NOTES, 'course', courseId],
    queryFn: () => notesService.byCourse(courseId),
    enabled: !!courseId,
    staleTime: 30000,
    select: (res) => res?.data ?? res ?? [],
  });

export const useNoteForLesson = (courseId, lessonId) =>
  useQuery({
    queryKey: [...QUERY_KEYS.NOTES, 'lesson', courseId, lessonId],
    queryFn: () => notesService.forLesson(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
    staleTime: 10000,
    select: (res) => res?.data ?? res,
  });

export const useSaveNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => notesService.save(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId) => notesService.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTES });
    },
  });
};

// ─── Bookmarks ───────────────────────────────────────

export const useBookmarks = (params) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKMARKS, 'list', params],
    queryFn: () => bookmarkService.list(params),
    staleTime: 30000,
    select: (res) => res?.data ?? res,
  });

export const useBookmarksByCourse = (courseId) =>
  useQuery({
    queryKey: [...QUERY_KEYS.BOOKMARKS, 'course', courseId],
    queryFn: () => bookmarkService.byCourse(courseId),
    enabled: !!courseId,
    staleTime: 30000,
    select: (res) => res?.data ?? res ?? [],
  });

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookmarkService.toggle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS });
    },
  });
};

const bookmarkKey = (courseId, lessonId) => `${courseId}:${lessonId || ''}`;

/** Bookmarks from the list or by-course responses, as a plain array. */
export const bookmarkItems = (data) => {
  const raw = data?.content ?? data?.data?.content ?? data ?? [];
  return Array.isArray(raw) ? raw : [];
};

/**
 * Bookmark state for buttons. `isBookmarked(courseId)` is the course bookmark,
 * `isBookmarked(courseId, lessonId)` a lesson bookmark. A click shows the new
 * state at once and is saved on the server; if saving fails the star goes back.
 */
export const useBookmarkToggle = (bookmarks, { onError } = {}) => {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState({});
  const mutation = useMutation({ mutationFn: (data) => bookmarkService.toggle(data) });

  const saved = useCallback(
    (courseId, lessonId) =>
      bookmarks.some((b) => b.courseId === courseId && (b.lessonId || null) === (lessonId || null)),
    [bookmarks],
  );

  const isBookmarked = useCallback(
    (courseId, lessonId) => {
      const key = bookmarkKey(courseId, lessonId);
      return key in pending ? pending[key] : saved(courseId, lessonId);
    },
    [pending, saved],
  );

  const toggle = useCallback(
    async ({ courseId, lessonId, label }) => {
      if (!courseId) return;
      const key = bookmarkKey(courseId, lessonId);
      setPending((p) => ({ ...p, [key]: !isBookmarked(courseId, lessonId) }));
      try {
        await mutation.mutateAsync({ courseId, lessonId: lessonId || null, label });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS });
      } catch (error) {
        onError?.(error);
      } finally {
        setPending(({ [key]: _done, ...rest }) => rest);
      }
    },
    [isBookmarked, mutation, queryClient, onError],
  );

  return { isBookmarked, toggle };
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmarkId) => bookmarkService.delete(bookmarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS });
    },
  });
};
