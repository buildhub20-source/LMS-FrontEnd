import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

const refresh = vi.fn();
const getCurrentUser = vi.fn();
vi.mock('../../src/features/auth/services/authService', () => ({
  default: {
    refresh: (...args) => refresh(...args),
    getCurrentUser: (...args) => getCurrentUser(...args),
  },
}));

import authReducer, { loadSession } from '../../src/features/auth/store/authSlice';
import tokenStorage from '../../src/services/storage/tokenStorage';

const store = () => configureStore({ reducer: { auth: authReducer } });

describe('session restore after a reload', () => {
  beforeEach(() => {
    tokenStorage.clear();
    refresh.mockReset();
    getCurrentUser.mockReset();
    getCurrentUser.mockResolvedValue({
      user: { id: 'u1', name: 'Ada' },
      roles: ['STUDENT'],
      permissions: [],
    });
  });

  it('exchanges the refresh token once even when restore runs twice at the same time', async () => {
    tokenStorage.setTokens({ refreshToken: 'r1' });
    refresh.mockResolvedValue({ accessToken: 'a2', refreshToken: 'r2' });
    const s = store();

    // React Strict Mode (development) mounts the provider twice.
    await Promise.all([s.dispatch(loadSession()), s.dispatch(loadSession())]);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getRefreshToken()).toBe('r2');
    expect(tokenStorage.getAccessToken()).toBe('a2');
  });

  it('signs out cleanly when the refresh token is rejected', async () => {
    tokenStorage.setTokens({ refreshToken: 'expired' });
    refresh.mockImplementation(async () => {
      throw Object.assign(new Error('Refresh token is not valid'), { status: 401 });
    });

    const result = await store().dispatch(loadSession());

    expect(result.payload).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });

  it('does nothing without a stored session', async () => {
    await store().dispatch(loadSession());

    expect(refresh).not.toHaveBeenCalled();
  });
});
