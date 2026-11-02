import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/api/axiosInstance', () => ({ http: { get: vi.fn() } }));

import { http } from '../../src/services/api/axiosInstance';
import { userService } from '../../src/features/users/services/userService';

describe('userService.list', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requests locked users from the server and preserves filtered pagination', async () => {
    http.get.mockResolvedValue({
      content: [{ id: '1', name: 'Locked user', locked: true, roles: [] }],
      totalElements: 1,
      totalPages: 1,
    });

    const result = await userService.list({ status: 'LOCKED', page: 0, size: 10 });

    expect(http.get).toHaveBeenCalledWith(expect.any(String), {
      params: { page: 0, size: 10, sort: 'createdAt,desc', locked: true },
    });
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.content[0].fullName).toBe('Locked user');
  });
});
