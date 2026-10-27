import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { analyticsService, certificateService, badges } = vi.hoisted(() => ({
  analyticsService: { studentProgress: vi.fn() },
  certificateService: { list: vi.fn() },
  badges: { data: [] },
}));
vi.mock('../../../src/features/analytics/services/analyticsService', () => ({
  default: analyticsService,
}));
vi.mock('../../../src/features/certificates/services/certificateService', () => ({
  default: certificateService,
}));
vi.mock('../../../src/features/assessments/services/assessmentService', () => ({
  default: { list: vi.fn().mockResolvedValue({ content: [] }) },
}));
vi.mock('../../../src/features/auth/hooks/useAuth', () => ({
  default: () => ({ user: { id: 's1', fullName: 'Asha Rao' } }),
}));
vi.mock('../../../src/features/courses/hooks/useCourses', () => ({
  useMyCourses: () => ({ data: { content: [] }, isLoading: false }),
}));
vi.mock('../../../src/features/resources/hooks/useResources', () => ({
  useResources: () => ({ data: [] }),
}));
vi.mock('../../../src/features/gamification/hooks/useGamification', () => ({
  useStudentBadges: () => badges,
}));

import { StudentDashboardPage } from '../../../src/features/analytics/pages/StudentDashboardPage';

const renderPage = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <StudentDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe('StudentDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    badges.data = [];
    certificateService.list.mockResolvedValue({ content: [{ id: 'c1' }], totalElements: 2 });
  });

  it('shows only real numbers for a new student and invents nothing', async () => {
    analyticsService.studentProgress.mockResolvedValue({
      enrolledCourses: 0,
      completedCount: 0,
      inProgressCount: 0,
      streakDays: 0,
      enrollmentTrend: [],
    });
    renderPage();

    expect(await screen.findByText('0 Day Streak')).toBeInTheDocument();
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(screen.getByText(/No badges yet/)).toBeInTheDocument();

    const text = document.body.textContent;
    for (const invented of [
      '35m / 45m',
      '+3.2h logged this week',
      '0 / 7 verifiable credentials',
      'Proctored Assessments are Live',
      'Top 12%',
      'LeetCode',
      'memory retention',
    ]) {
      expect(text).not.toContain(invented);
    }
  });

  it('shows unavailable and makes one request during a certificate outage', async () => {
    analyticsService.studentProgress.mockResolvedValue({ streakDays: 0, enrollmentTrend: [] });
    certificateService.list.mockRejectedValue(new Error('Certificate service unavailable'));
    renderPage();
    expect(await screen.findByText('Unavailable')).toBeInTheDocument();
    expect(certificateService.list).toHaveBeenCalledTimes(1);
  });

  it("lists the student's earned badges", async () => {
    analyticsService.studentProgress.mockResolvedValue({ streakDays: 3, enrollmentTrend: [] });
    badges.data = [
      { id: 'b1', name: 'First Steps', icon: '🎯', awardedAt: '2026-10-01T00:00:00Z' },
      { id: 'b2', name: 'Marathon', icon: '🏃', awardedAt: null },
    ];
    renderPage();

    expect(await screen.findByText(/First Steps/)).toBeInTheDocument();
    expect(screen.getByText('1 of 2 earned')).toBeInTheDocument();
    expect(screen.queryByText(/Marathon/)).not.toBeInTheDocument();
  });
});
