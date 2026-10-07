import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const course = {
  id: 'course-1',
  title: 'Java Foundations',
  modules: [{ id: 'm1', title: 'Basics', lessons: [{ id: 'l1', title: 'Variables', type: 'ARTICLE', content: 'Hello' }] }],
};

vi.mock('../../../src/features/courses/hooks/useCourse', () => ({
  default: () => ({ data: course, isLoading: false, error: null, refetch: vi.fn() }),
}));
vi.mock('../../../src/features/courses/hooks/useCourses', () => ({
  useDeleteCourse: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('../../../src/features/auth/hooks/useAuth', () => ({
  default: () => ({ user: { id: 'student-1' } }),
}));
vi.mock('../../../src/hooks/usePermission', () => ({
  default: () => ({ hasPermission: () => false, hasAnyRole: () => false }),
}));
vi.mock('../../../src/components/feedback/Toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));
vi.mock('../../../src/features/learning/services/learningService', () => ({
  default: {
    getProgress: vi.fn().mockResolvedValue({ completedLessonIds: [] }),
    saveProgress: vi.fn().mockResolvedValue({ completedLessonIds: [] }),
  },
}));
vi.mock('../../../src/features/courses/services/courseService', () => ({
  default: { getRecordingPlaybackUrl: vi.fn().mockResolvedValue({}) },
}));
vi.mock('../../../src/features/courses/components/CourseAnalyticsTab', () => ({ default: () => null }));
vi.mock('../../../src/features/courses/components/LessonNotesPanel', () => ({ default: () => null }));
vi.mock('../../../src/features/courses/components/LessonResourcesPanel', () => ({ default: () => null }));

import { CourseDetailsPage } from '../../../src/features/courses/pages/CourseDetailsPage';

describe('CourseDetailsPage', () => {
  it('renders a course for a student', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/learn/courses/course-1']}>
          <Routes>
            <Route path="/learn/courses/:courseId" element={<CourseDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getAllByText('Java Foundations').length).toBeGreaterThan(0);
  });
});
