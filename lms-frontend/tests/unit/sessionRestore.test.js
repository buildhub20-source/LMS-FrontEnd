import { describe, it, expect, beforeEach, vi } from 'vitest';
import tokenStorage from '../../src/services/storage/tokenStorage';
import { createResponseErrorHandler } from '../../src/services/api/responseInterceptor';

describe('tokenStorage', () => {
  beforeEach(() => {
    tokenStorage.clear();
  });

  it('keeps the refresh token for this tab only by default', () => {
    tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r1' });

    expect(sessionStorage.getItem('lms.refreshToken')).toBe('r1');
    expect(localStorage.getItem('lms.refreshToken')).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBe('r1');
  });

  it('keeps it across browser restarts when "Remember me" is ticked', () => {
    tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r1' }, { persist: true });

    expect(localStorage.getItem('lms.refreshToken')).toBe('r1');
    expect(sessionStorage.getItem('lms.refreshToken')).toBeNull();
  });

  it('a rotated token stays where the user chose to keep it', () => {
    tokenStorage.setTokens({ refreshToken: 'r1' }, { persist: true });
    tokenStorage.setTokens({ refreshToken: 'r2' });

    expect(localStorage.getItem('lms.refreshToken')).toBe('r2');
    expect(tokenStorage.getRefreshToken()).toBe('r2');
  });

  it('signing out clears both stores', () => {
    tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r1' }, { persist: true });
    tokenStorage.clear();

    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});

describe('refresh on 401', () => {
  beforeEach(() => {
    tokenStorage.clear();
  });

  it('reads the new tokens from inside the ApiResponse envelope and retries', async () => {
    tokenStorage.setTokens({ refreshToken: 'old-refresh' });
    const client = vi.fn().mockResolvedValue({ data: { ok: true } });
    client.post = vi.fn().mockResolvedValue({
      data: { success: true, data: { accessToken: 'new-access', refreshToken: 'new-refresh' } },
    });
    const handler = createResponseErrorHandler(client);

    const original = { url: '/auth/me', headers: {} };
    await handler({ config: original, response: { status: 401, data: {} } });

    expect(client.post).toHaveBeenCalledWith(expect.stringContaining('refresh'), {
      refreshToken: 'old-refresh',
    });
    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh');
    expect(original.headers.Authorization).toBe('Bearer new-access');
    expect(client).toHaveBeenCalledWith(original);
  });
});
