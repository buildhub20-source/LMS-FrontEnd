import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryObserver } from '@tanstack/react-query';
import {
  isCourseCompleted,
  isCourseInProgress,
  studyDurationLabel,
} from '../../src/utils/courseProgress';
import { eventsInMonth, eventRoute } from '../../src/features/calendar/calendarUtils';
import { certificateListOptions } from '../../src/features/certificates/services/certificateQueries';
import certificateService from '../../src/features/certificates/services/certificateService';
import CertificateListPage from '../../src/features/certificates/pages/CertificateListPage';
import StudentCalendarPage from '../../src/features/calendar/pages/StudentCalendarPage';

vi.mock('../../src/features/certificates/services/certificateService', () => ({
  default: { list: vi.fn(), download: vi.fn() },
}));
vi.mock('../../src/features/auth/hooks/useAuth', () => ({
  default: () => ({ user: { id: 'student-qa' } }),
}));
vi.mock('../../src/features/certificates/components/ImportCertificateModal', () => ({
  default: () => null,
}));
vi.mock('../../src/features/calendar/hooks/useCalendar', () => ({
  useCalendarEvents: () => ({
    data: [
      { id: 'old', title: 'Old event', type: 'COURSE_ENROLLED', startTime: '2020-01-15T12:00:00Z' },
    ],
    isLoading: false,
  }),
  useUpcomingDeadlines: () => ({ data: [], isLoading: false }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('production checklist regressions', () => {
  it('uses enrollment status for course counts even when lesson progress disagrees', () => {
    const active = { enrollmentStatus: 'ACTIVE', progressPercent: 100 };
    const completed = { enrollmentStatus: 'COMPLETED', progressPercent: 50 };
    const cancelled = { enrollmentStatus: 'CANCELLED', progressPercent: 0 };
    expect(isCourseInProgress(active)).toBe(true);
    expect(isCourseCompleted(active)).toBe(false);
    expect(isCourseCompleted(completed)).toBe(true);
    expect(isCourseInProgress(completed)).toBe(false);
    expect(isCourseInProgress(cancelled)).toBe(false);
    expect(isCourseInProgress({ progressPercent: 0 })).toBe(true);
  });

  it('shows short study sessions without rounding them to zero', () => {
    expect(studyDurationLabel(0)).toBe('0 min');
    expect(studyDurationLabel(20)).toBe('<1 min');
    expect(studyDurationLabel(90)).toBe('1 min');
    expect(studyDurationLabel(170)).toBe('2 min');
  });

  it('filters and sorts a monthly timeline across year boundaries', () => {
    const events = [
      { id: 3, startTime: '2027-01-10T12:00:00' },
      { id: 1, startTime: '2026-12-31T12:00:00' },
      { id: 2, startTime: '2027-01-02T12:00:00' },
    ];
    expect(eventsInMonth(events, 2027, 0).map((e) => e.id)).toEqual([2, 3]);
    expect(eventRoute({ type: 'COURSE_MILESTONE', isImported: true })).toBeNull();
    expect(eventRoute({ type: 'COURSE_ENROLLED' })).toBeNull();
  });

  it('does not show old events in the current monthly timeline and labels navigation', () => {
    render(
      <MemoryRouter>
        <StudentCalendarPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Monthly Timeline' }));
    expect(screen.queryByText('Old event')).not.toBeInTheDocument();
    expect(screen.getByText('No milestones recorded for this month.')).toBeInTheDocument();
  });

  it('does not retry a certificate outage on another page; explicit retry works', async () => {
    certificateService.list
      .mockRejectedValueOnce(new Error('Certificate service unavailable'))
      .mockResolvedValue({ content: [], totalElements: 0 });
    const client = new QueryClient();
    const first = new QueryObserver(client, certificateListOptions('student-qa'));
    const stopFirst = first.subscribe(() => {});
    await vi.waitFor(() => expect(first.getCurrentResult().isError).toBe(true));
    stopFirst();
    const next = new QueryObserver(client, certificateListOptions('student-qa'));
    const stopNext = next.subscribe(() => {});
    expect(next.getCurrentResult().isError).toBe(true);
    expect(certificateService.list).toHaveBeenCalledTimes(1);
    await next.refetch();
    expect(next.getCurrentResult().isSuccess).toBe(true);
    expect(certificateService.list).toHaveBeenCalledTimes(2);
    expect(certificateListOptions('another-student').queryKey).not.toEqual(next.options.queryKey);
    stopNext();
    client.clear();
  });

  it('renders certificates from the unwrapped API page', async () => {
    certificateService.list.mockResolvedValue({
      content: [
        {
          id: 'c1',
          courseTitle: 'QA Course Award',
          courseName: 'QA Course Award',
          serialNumber: 'QA-001',
          studentName: 'Test Learner',
          issuedAt: '2026-10-25T12:00:00Z',
        },
      ],
      totalElements: 1,
    });
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <CertificateListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/All Credentials \(1\)/)).toBeInTheDocument();
    client.clear();
  });
});
