import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@monaco-editor/react', () => ({ default: () => <pre data-testid="editor" /> }));
vi.mock('../../../src/features/assessments/services/assessmentService', () => ({
  default: { saveSubmissionDraft: vi.fn().mockResolvedValue({}) },
}));

import { CodingQuestionPanel } from '../../../src/features/assessments/components/CodingQuestionPanel';

const question = {
  id: 'q1',
  title: 'Sum of two numbers',
  description: 'Print the sum.',
  sampleTestCases: [{ id: 't1', input: '1 2', expectedOutput: '3' }],
};

const runWith = async (draft) => {
  render(<CodingQuestionPanel question={question} draft={draft} onDraftChange={() => {}} />);
  await userEvent.click(screen.getAllByRole('button', { name: /run/i })[0]);
};

describe('CodingQuestionPanel runner', () => {
  it('does not pretend to run languages it cannot execute', async () => {
    // This used to "pass" by pattern-matching the print statement.
    await runWith({ language: 'python', sourceCode: 'print("3")' });

    expect(
      await screen.findByText(/Running Python 3.11 code isn't available yet/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sample test cases passed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Runtime:/)).not.toBeInTheDocument();
  });

  it('asks for code before running', async () => {
    await runWith({ language: 'javascript', sourceCode: '   ' });

    expect(await screen.findByText('Write some code before running it.')).toBeInTheDocument();
  });
});
