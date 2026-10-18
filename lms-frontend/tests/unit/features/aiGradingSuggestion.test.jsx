import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { gradingService, rubricService } = vi.hoisted(() => ({
  gradingService: {
    getPendingSubmissions: vi.fn(),
    gradeAttemptSubmission: vi.fn(),
    requestAiSuggestion: vi.fn(),
    getAiSuggestion: vi.fn(),
  },
  rubricService: { list: vi.fn() },
}));
vi.mock('../../../src/features/assessments/services/gradingService', () => ({
  default: gradingService,
}));
vi.mock('../../../src/features/assessments/services/rubricService', () => ({
  default: rubricService,
}));
vi.mock('@monaco-editor/react', () => ({ default: () => <pre data-testid="editor" /> }));

import { GradingWorkflowPage } from '../../../src/features/assessments/pages/GradingWorkflowPage';
import { AiSuggestionPanel } from '../../../src/features/assessments/components/AiSuggestionPanel';
import { prefillFromSuggestion } from '../../../src/features/assessments/utils/aiSuggestion';

const suggestion = {
  id: 's1',
  submissionId: 'sub-1',
  status: 'SUGGESTED',
  score: 7.5,
  maxScore: 10,
  testsPassed: 1,
  testsTotal: 2,
  result: {
    ranCode: true,
    testResults: [
      { testCaseId: 't1', hidden: false, passed: true, actualOutput: '3', error: null },
      {
        testCaseId: 't2',
        hidden: true,
        passed: false,
        actualOutput: '',
        error: 'Prints -0 for zero',
      },
    ],
    rubric: [
      {
        criterionId: 'c1',
        criterionName: 'Correctness',
        score: 4.6,
        maxPoints: 6,
        comment: 'Misses zero.',
      },
    ],
    feedback: 'Works for positive inputs.',
    suggestions: ['Handle the zero case explicitly.'],
  },
};

describe('prefillFromSuggestion', () => {
  it('uses the suggested total when no rubric is selected', () => {
    expect(prefillFromSuggestion(suggestion, undefined)).toEqual({
      rubricScores: null,
      manualScore: '8',
      status: 'PARTIAL_SUCCESS',
    });
  });

  it("fills the selected rubric's criteria and leaves the total to the rubric", () => {
    const rubric = {
      id: 'r1',
      criteria: [
        { id: 'c1', maxPoints: 6 },
        { id: 'c2', maxPoints: 4 },
      ],
    };
    expect(prefillFromSuggestion(suggestion, rubric)).toEqual({
      rubricScores: { c1: { score: 5, feedback: 'Misses zero.' } },
      manualScore: '',
      status: 'PARTIAL_SUCCESS',
    });
  });

  it('marks all-passing answers accepted and all-failing ones wrong', () => {
    expect(prefillFromSuggestion({ ...suggestion, testsPassed: 2 }).status).toBe('ACCEPTED');
    expect(prefillFromSuggestion({ ...suggestion, testsPassed: 0 }).status).toBe('WRONG_ANSWER');
  });
});

describe('AiSuggestionPanel', () => {
  it('shows the score, test results, feedback and suggestions', () => {
    render(<AiSuggestionPanel suggestion={suggestion} />);

    expect(screen.getByText(/AI suggestion: 7.5 \/ 10/)).toBeInTheDocument();
    expect(screen.getByText('1 of 2 tests passed')).toBeInTheDocument();
    expect(screen.getByText(/hidden from students/)).toBeInTheDocument();
    expect(screen.getByText('Prints -0 for zero')).toBeInTheDocument();
    expect(screen.getByText('Works for positive inputs.')).toBeInTheDocument();
    expect(screen.getByText('Handle the zero case explicitly.')).toBeInTheDocument();
    expect(screen.getByText(/Students see only the grade you save/)).toBeInTheDocument();
  });

  it('explains a failed attempt', () => {
    render(
      <AiSuggestionPanel
        suggestion={{
          status: 'FAILED',
          errorMessage: 'The submission could not be graded automatically',
        }}
      />,
    );
    expect(screen.getByText(/did not finish/)).toBeInTheDocument();
    expect(screen.getByText(/could not be graded automatically/)).toBeInTheDocument();
  });
});

describe('GradingWorkflowPage AI suggestion', () => {
  const pending = {
    content: [
      {
        id: 'sub-1',
        attemptId: 'att-1',
        questionId: 'q1',
        language: 'PYTHON',
        sourceCode: 'print(3)',
        status: 'SUBMITTED',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    gradingService.getPendingSubmissions.mockResolvedValue(pending);
    gradingService.getAiSuggestion.mockRejectedValue({ response: { status: 404 } });
    rubricService.list.mockResolvedValue({ content: [] });
  });

  it('requests a suggestion and pre-fills the score for review', async () => {
    gradingService.requestAiSuggestion.mockResolvedValue(suggestion);
    render(<GradingWorkflowPage />);

    await userEvent.click(await screen.findByRole('button', { name: /suggest with ai/i }));

    expect(gradingService.requestAiSuggestion).toHaveBeenCalledWith('sub-1', '');
    expect(await screen.findByText(/AI suggestion: 7.5 \/ 10/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
    expect(gradingService.gradeAttemptSubmission).not.toHaveBeenCalled();
  });

  it('shows why a suggestion could not be made', async () => {
    gradingService.requestAiSuggestion.mockRejectedValue({
      response: { data: { message: 'AI grading is not enabled for this workspace' } },
    });
    render(<GradingWorkflowPage />);

    await userEvent.click(await screen.findByRole('button', { name: /suggest with ai/i }));

    await waitFor(() =>
      expect(screen.getByText('AI grading is not enabled for this workspace')).toBeInTheDocument(),
    );
  });

  it('shows an earlier suggestion when the submission is opened', async () => {
    gradingService.getAiSuggestion.mockResolvedValue(suggestion);
    render(<GradingWorkflowPage />);

    expect(await screen.findByText(/AI suggestion: 7.5 \/ 10/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suggest again/i })).toBeInTheDocument();
  });
});
