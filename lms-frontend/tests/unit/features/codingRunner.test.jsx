import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@monaco-editor/react', () => ({ default: () => <pre data-testid="editor" /> }));
vi.mock('../../../src/features/assessments/services/assessmentService', () => ({
  default: { saveSubmissionDraft: vi.fn().mockResolvedValue({}) },
}));
// A plain fake HTTP client: vi.fn() would report a rejected promise as unhandled
// even though the component catches it.
const calls = [];
let respond = () => Promise.resolve([]);
const post = (...args) => {
  calls.push(args);
  return respond(...args);
};
vi.mock('../../../src/services/api/axiosInstance', () => ({
  http: { post: (...args) => post(...args) },
}));
const runOnServer = {
  mockReset: () => {
    calls.length = 0;
    respond = () => Promise.resolve([]);
  },
  mockResolvedValue: (v) => {
    respond = () => Promise.resolve(v);
  },
  mockRejectedValue: (v) => {
    respond = () => Promise.reject(v);
  },
};

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
  beforeEach(() => runOnServer.mockReset());

  it('says so when the server has no code runner, and invents no result', async () => {
    // Shape produced by the API layer's normalizeError.
    runOnServer.mockRejectedValue({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      message: 'Not set up',
    });

    await runWith({ language: 'python', sourceCode: 'print("3")' });

    expect(
      await screen.findByText(/Running Python 3.11 code isn't set up on this server yet/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/sample test cases passed/i)).not.toBeInTheDocument();
  });

  it('runs other languages on the server and checks the output', async () => {
    runOnServer.mockResolvedValue([{ status: 'ACCEPTED', stdout: '3\n', timeMs: 12 }]);

    await runWith({ language: 'python', sourceCode: 'print(sum(map(int, input().split())))' });

    expect(await screen.findByText('All sample test cases passed')).toBeInTheDocument();
    expect(calls).toContainEqual([
      '/code/run',
      {
        language: 'python',
        sourceCode: expect.any(String),
        inputs: ['1 2'],
      },
    ]);
  });

  it('shows compiler output instead of a pass', async () => {
    runOnServer.mockResolvedValue([
      { status: 'COMPILE_ERROR', compileOutput: "error: expected ';' before '}'" },
    ]);

    await runWith({ language: 'cpp', sourceCode: 'int main(){return 0}' });

    expect(await screen.findAllByText(/Compilation failed: error: expected ';'/)).not.toHaveLength(
      0,
    );
    expect(screen.queryByText('All sample test cases passed')).not.toBeInTheDocument();
  });

  it('asks for code before running', async () => {
    await runWith({ language: 'javascript', sourceCode: '   ' });

    expect(await screen.findByText('Write some code before running it.')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });
});
