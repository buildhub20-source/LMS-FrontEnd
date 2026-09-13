import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      />
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
      />
    );

    const allNotesBtn = screen.getByText('All Course Notes');
    fireEvent.click(allNotesBtn);

    expect(screen.getByText(/No notes saved across this course yet/i)).toBeInTheDocument();
  });
});

describe('LessonResourcesPanel', () => {
  it('renders default study resources and handles download click', () => {
    const lesson = { id: 'l-101', title: 'Binary Search Basics' };
    const course = { title: 'Algorithms' };

    render(<LessonResourcesPanel currentLesson={lesson} course={course} />);

    expect(screen.getByText('Lesson Resources & Downloads')).toBeInTheDocument();
    expect(screen.getByText(/Syllabus & Objectives/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Concepts & Reference/i)).toBeInTheDocument();

    const downloadButtons = screen.getAllByRole('button', { name: /Download/i });
    expect(downloadButtons.length).toBeGreaterThan(0);
  });
});
