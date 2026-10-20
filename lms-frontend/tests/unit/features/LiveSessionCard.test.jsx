import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LiveSessionCard from '../../../src/features/liveSessions/components/LiveSessionCard';

describe('LiveSessionCard', () => {
  const baseSession = {
    id: 's-101',
    courseId: 'c-202',
    title: 'Spring Boot Architecture Deep Dive',
    description: 'Explore hexagonal architecture and LiveKit WebRTC.',
    status: 'SCHEDULED',
    scheduledStart: '2026-09-18T10:00:00Z',
    scheduledEnd: '2026-09-18T11:00:00Z',
    instructorName: 'Dr. Jane Smith',
  };

  it('renders scheduled session with instructor start button', () => {
    const onStart = vi.fn();
    render(
      <MemoryRouter>
        <LiveSessionCard
          session={baseSession}
          isInstructor={true}
          onStart={onStart}
          onEnd={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Spring Boot Architecture Deep Dive')).toBeInTheDocument();
    expect(screen.getByText(/Explore hexagonal architecture/i)).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /Start Class Now/i });
    expect(startBtn).toBeInTheDocument();

    fireEvent.click(startBtn);
    expect(onStart).toHaveBeenCalledWith('s-101');
  });

  it('renders student view for scheduled session as awaiting start', () => {
    render(
      <MemoryRouter>
        <LiveSessionCard
          session={baseSession}
          isInstructor={false}
          onStart={vi.fn()}
          onEnd={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Awaiting Instructor to Start/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Class Now/i })).not.toBeInTheDocument();
  });

  it('renders LIVE state with live badge and join button', () => {
    const liveSession = { ...baseSession, status: 'LIVE' };
    render(
      <MemoryRouter>
        <LiveSessionCard
          session={liveSession}
          isInstructor={false}
          onStart={vi.fn()}
          onEnd={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('LIVE NOW')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Classroom/i })).toBeInTheDocument();
  });

  it('renders Ended state with Completed status badge', () => {
    const endedSession = { ...baseSession, status: 'ENDED' };
    render(
      <MemoryRouter>
        <LiveSessionCard
          session={endedSession}
          isInstructor={false}
          onStart={vi.fn()}
          onEnd={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ended')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows a missed class as not held, with no start button', () => {
    render(
      <MemoryRouter>
        <LiveSessionCard
          session={{ ...baseSession, status: 'MISSED', description: null }}
          isInstructor={true}
          onStart={vi.fn()}
          onEnd={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText(/Not held/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start Class Now/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Live interactive session covering/)).not.toBeInTheDocument();
  });
});
