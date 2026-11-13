import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookmarkToggle, bookmarkItems } from '../../src/features/notes/hooks/useNotes';
import { bookmarkService } from '../../src/features/notes/services/notesService';

vi.mock('../../src/features/notes/services/notesService', () => ({
  notesService: {},
  bookmarkService: { toggle: vi.fn() },
}));

const wrapper = ({ children }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

beforeEach(() => vi.clearAllMocks());

describe('useBookmarkToggle', () => {
  const saved = [
    { id: 'b1', courseId: 'c1', lessonId: null },
    { id: 'b2', courseId: 'c2', lessonId: 'l1' },
  ];

  it('tells course bookmarks and lesson bookmarks apart', () => {
    const { result } = renderHook(() => useBookmarkToggle(saved), { wrapper });
    expect(result.current.isBookmarked('c1')).toBe(true);
    expect(result.current.isBookmarked('c2')).toBe(false);
    expect(result.current.isBookmarked('c2', 'l1')).toBe(true);
    expect(result.current.isBookmarked('c1', 'l1')).toBe(false);
  });

  it('saves a course bookmark on the server without a lesson', async () => {
    bookmarkService.toggle.mockResolvedValue({ data: { bookmarked: true } });
    const { result } = renderHook(() => useBookmarkToggle([]), { wrapper });

    await act(() => result.current.toggle({ courseId: 'c3', label: 'Java' }));

    expect(bookmarkService.toggle).toHaveBeenCalledWith({
      courseId: 'c3',
      lessonId: null,
      label: 'Java',
    });
  });

  it('puts the star back and reports when saving fails', async () => {
    bookmarkService.toggle.mockRejectedValue(new Error('offline'));
    const onError = vi.fn();
    const { result } = renderHook(() => useBookmarkToggle([], { onError }), { wrapper });

    await act(() => result.current.toggle({ courseId: 'c3' }));

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(result.current.isBookmarked('c3')).toBe(false);
  });

  it('reads both response shapes', () => {
    expect(bookmarkItems({ content: saved })).toHaveLength(2);
    expect(bookmarkItems(saved)).toHaveLength(2);
    expect(bookmarkItems(undefined)).toEqual([]);
  });
});
