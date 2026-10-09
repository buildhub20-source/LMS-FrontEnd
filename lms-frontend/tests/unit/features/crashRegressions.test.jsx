import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../../src/features/chat/services/chatService', () => ({
  default: {
    getMembers: vi.fn().mockResolvedValue([{ user_id: 'u1', name: 'Owner', role: 'owner' }]),
    getUsers: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../../src/features/assessments/components/CodingQuestionPanel', () => ({
  default: () => <div>coding panel</div>,
}));

vi.mock('../../../src/features/assessments/components/McqQuestionPanel', () => ({
  default: () => <div>mcq panel</div>,
}));

import ChannelDetailsModal from '../../../src/features/chat/components/ChannelDetailsModal';
import QuestionPreviewModal from '../../../src/features/assessments/components/QuestionPreviewModal';

describe('ChannelDetailsModal', () => {
  const channel = { id: 'c1', name: 'general', type: 'GROUP', creator_id: 'u1' };

  it('opens without crashing and shows owner controls to the owner', async () => {
    render(<ChannelDetailsModal isOpen channel={channel} currentUser={{ id: 'u1' }} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByText('Edit')).toBeInTheDocument());
  });

  it('hides owner controls from an ordinary member', async () => {
    render(
      <ChannelDetailsModal isOpen channel={{ ...channel, creator_id: 'someone-else' }} currentUser={{ id: 'u2' }} onClose={() => {}} />,
    );

    await waitFor(() => expect(screen.getByText('general')).toBeInTheDocument());
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});

describe('QuestionPreviewModal', () => {
  it('survives being opened and closed again', () => {
    const question = { title: 'Two Sum', questionType: 'CODING', testCases: [] };
    const { rerender } = render(<QuestionPreviewModal isOpen={false} questionData={question} onClose={() => {}} />);

    rerender(<QuestionPreviewModal isOpen questionData={question} onClose={() => {}} />);
    expect(screen.getByText('Student Experience Preview')).toBeInTheDocument();

    rerender(<QuestionPreviewModal isOpen={false} questionData={question} onClose={() => {}} />);
    expect(screen.queryByText('Student Experience Preview')).not.toBeInTheDocument();
  });
});
