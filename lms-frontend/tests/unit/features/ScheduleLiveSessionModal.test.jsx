import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScheduleLiveSessionModal from '../../../src/features/liveSessions/components/ScheduleLiveSessionModal';

describe('session mode selection', () => {
  it('lets instructors use the connected organization calendar without managing its connection', () => {
    render(<ScheduleLiveSessionModal isOpen onClose={vi.fn()} onSchedule={vi.fn()} initialCourseId="course" liveSessionProvider="GOOGLE_MEET" googleCalendarConnected googleCalendarEmail="admin@example.com" />);
    fireEvent.click(screen.getByLabelText('Google Meet'));
    expect(screen.getByText(/Calendar connected: admin@example.com/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /connected Google account/i })).not.toBeInTheDocument();
  });

  it('lets administrators manage the organization calendar connection', () => {
    const connect = vi.fn();
    render(<ScheduleLiveSessionModal isOpen onClose={vi.fn()} onSchedule={vi.fn()} initialCourseId="course" liveSessionProvider="GOOGLE_MEET" googleCalendarConnected canManageGoogleCalendar onConnectGoogleCalendar={connect} />);
    fireEvent.click(screen.getByLabelText('Google Meet'));
    fireEvent.click(screen.getByRole('button', { name: /change connected Google account/i }));
    expect(connect).toHaveBeenCalledOnce();
  });

  it('requires a choice and submits each selected mode', () => {
    const onSchedule = vi.fn();
    const { rerender } = render(<ScheduleLiveSessionModal isOpen onClose={vi.fn()} onSchedule={onSchedule} initialCourseId="course" />);
    fireEvent.change(screen.getByPlaceholderText(/Live Q&A/), { target: { value: 'Test class' } });
    const submit = screen.getByRole('button', { name: 'Schedule Class' });
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Live session'));
    fireEvent.click(submit);
    expect(onSchedule).toHaveBeenLastCalledWith(expect.objectContaining({ sessionMode: 'live' }));
    expect(screen.getByLabelText('Google Meet')).toBeDisabled();
    rerender(<ScheduleLiveSessionModal isOpen onClose={vi.fn()} onSchedule={onSchedule} initialCourseId="course" liveSessionProvider="GOOGLE_MEET" />);
    expect(screen.getByLabelText('Live session')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Google Meet'));
    fireEvent.click(submit);
    expect(onSchedule).toHaveBeenLastCalledWith(expect.objectContaining({ sessionMode: 'google_meet' }));
    expect(screen.queryByText(/recording/i)).not.toBeInTheDocument();
  });
});
