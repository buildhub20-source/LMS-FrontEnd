import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonNotesPanel from '../../../src/features/courses/components/LessonNotesPanel';
import LessonResourcesPanel from '../../../src/features/courses/components/LessonResourcesPanel';

describe('LessonNotesPanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders current lesson notes and allows writing note content', () => {
    const lesson = { id: 'l-101', title: 'Binary Search Basics', moduleTitle: 'Module 1' };
    render(
      <LessonNotesPanel
        courseId="c-1"
        courseTitle="Algorithms"
        currentLesson={lesson}
        allLessons={[lesson]}
      />,
    );

    expect(screen.getByText('Binary Search Basics')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/Write your personal notes/i);
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Time complexity is O(log n).' } });
    expect(textarea.value).toBe('Time complexity is O(log n).');
  });

  it('switches to All Course Notes tab and handles empty state', () => {
    const lesson = { id: 'l-101', title: 'Binary Search Basics', moduleTitle: 'Module 1' };
    render(
      <LessonNotesPanel
        courseId="c-1"
        courseTitle="Algorithms"
        currentLesson={lesson}
        allLessons={[lesson]}
      />,
    );

    const allNotesBtn = screen.getByText('All Course Notes');
    fireEvent.click(allNotesBtn);

    expect(screen.getByText(/No notes saved across this course yet/i)).toBeInTheDocument();
  });

  it('inserts current video timestamp and supports click-to-seek', () => {
    const onSeek = vi.fn();
    const lesson = { id: 'l-101', title: 'Binary Search Basics', moduleTitle: 'Module 1' };

    render(
      <LessonNotesPanel
        courseId="c-1"
        courseTitle="Algorithms"
        currentLesson={lesson}
        allLessons={[lesson]}
        currentVideoTime={125}
        onSeekToTime={onSeek}
      />,
    );

    // 125 seconds = 02:05
    const timestampBtn = screen.getByTitle('Insert current video timestamp');
    expect(timestampBtn).toBeInTheDocument();
    expect(screen.getByText('02:05')).toBeInTheDocument();

    fireEvent.click(timestampBtn);
    const textarea = screen.getByPlaceholderText(/Write your personal notes/i);
    expect(textarea.value).toContain('[02:05]');

    // Test clicking the rendered timestamp badge
    const seekBadge = screen.getByTitle('Jump video to 02:05');
    expect(seekBadge).toBeInTheDocument();
    fireEvent.click(seekBadge);
    expect(onSeek).toHaveBeenCalledWith(125);
  });
});

describe('LessonResourcesPanel', () => {
  it('shows an empty state instead of advertising files that were never uploaded', () => {
    const lesson = { id: 'l-101', title: 'Binary Search Basics' };

    render(<LessonResourcesPanel currentLesson={lesson} />);

    expect(screen.getByText('Lesson Resources & Downloads')).toBeInTheDocument();
    expect(screen.getByText('0 files available')).toBeInTheDocument();
    expect(screen.getByText('No lesson resources have been uploaded yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Download/i })).not.toBeInTheDocument();
  });

  it('opens a resource only when the lesson has a real file URL', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const lesson = {
      id: 'l-101',
      resources: [
        { id: 'missing', title: 'Missing PDF', type: 'PDF' },
        { id: 'uploaded', title: 'Uploaded PDF', type: 'PDF', url: 'https://example.com/file.pdf' },
      ],
    };

    render(<LessonResourcesPanel currentLesson={lesson} />);

    expect(screen.getByText('1 file available')).toBeInTheDocument();
    expect(screen.queryByText('Missing PDF')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Download' }));
    expect(open).toHaveBeenCalledWith(
      'https://example.com/file.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    open.mockRestore();
  });
});
