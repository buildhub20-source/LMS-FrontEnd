import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useMessages from '../../../../src/features/chat/hooks/useMessages';
import chatService from '../../../../src/features/chat/services/chatService';
import chatSocketService from '../../../../src/features/chat/services/chatSocketService';

vi.mock('../../../../src/features/chat/services/chatService', () => ({
  default: { getMessages: vi.fn(), getPinnedMessages: vi.fn() },
}));
vi.mock('../../../../src/features/chat/services/chatSocketService', () => ({
  default: { on: vi.fn(() => vi.fn()), markRead: vi.fn() },
}));
vi.mock('../../../../src/features/auth/hooks/useAuth', () => ({
  default: () => ({ user: { id: 'me' } }),
}));

describe('useMessages channel transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    chatService.getPinnedMessages.mockResolvedValue([]);
  });

  it('ignores history and pins that arrive after switching channels', async () => {
    let finishOldHistory;
    let finishOldPins;
    chatService.getMessages.mockImplementation((channel) =>
      channel === 'old'
        ? new Promise((resolve) => {
            finishOldHistory = resolve;
          })
        : Promise.resolve([{ id: 'new-message', channelId: 'new' }]),
    );
    chatService.getPinnedMessages.mockImplementation((channel) =>
      channel === 'old'
        ? new Promise((resolve) => {
            finishOldPins = resolve;
          })
        : Promise.resolve([{ id: 'new-pin' }]),
    );
    const { result, rerender } = renderHook(({ channel }) => useMessages(channel), {
      initialProps: { channel: 'old' },
    });
    rerender({ channel: 'new' });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      finishOldHistory([{ id: 'old-message', channelId: 'old' }]);
      finishOldPins([{ id: 'old-pin' }]);
    });
    expect(result.current.messages.map((message) => message.id)).toEqual(['new-message']);
    expect(result.current.pinnedMessages.map((message) => message.id)).toEqual(['new-pin']);
    expect(chatSocketService.markRead).toHaveBeenCalledWith('new', 'new-message');
    expect(chatSocketService.markRead).not.toHaveBeenCalledWith('old', 'old-message');
  });

  it('clears messages and replies when leaving the channel', async () => {
    chatService.getMessages.mockResolvedValue([{ id: 'message' }]);
    const { result, rerender } = renderHook(({ channel }) => useMessages(channel), {
      initialProps: { channel: 'active' },
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.setReplyTo({ id: 'message' }));
    rerender({ channel: null });
    expect(result.current.messages).toEqual([]);
    expect(result.current.pinnedMessages).toEqual([]);
    expect(result.current.replyTo).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('ignores an older-page response after switching channels', async () => {
    let finishOldPage;
    const oldHistory = Array.from({ length: 50 }, (_, index) => ({
      id: `old-${index}`,
      channelId: 'old',
    }));
    chatService.getMessages.mockImplementation((channel, options) => {
      if (channel === 'old' && options.before) {
        return new Promise((resolve) => {
          finishOldPage = resolve;
        });
      }
      return Promise.resolve(
        channel === 'old' ? oldHistory : [{ id: 'new-message', channelId: 'new' }],
      );
    });

    const { result, rerender } = renderHook(({ channel }) => useMessages(channel), {
      initialProps: { channel: 'old' },
    });
    await waitFor(() => expect(result.current.messages).toHaveLength(50));
    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(finishOldPage).toBeTypeOf('function'));

    rerender({ channel: 'new' });
    await waitFor(() =>
      expect(result.current.messages.map((message) => message.id)).toEqual(['new-message']),
    );
    await act(async () => {
      finishOldPage([{ id: 'older-old-message', channelId: 'old' }]);
    });

    expect(result.current.messages.map((message) => message.id)).toEqual(['new-message']);
    expect(result.current.isLoading).toBe(false);
  });
});
