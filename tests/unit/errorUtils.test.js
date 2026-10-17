import { describe, it, expect } from 'vitest';
import { normalizeError } from '../../src/utils/errorUtils';

describe('normalizeError', () => {
  it('prefers the API message', () => {
    const result = normalizeError({ response: { status: 422, data: { message: 'Email taken' } } });
    expect(result.message).toBe('Email taken');
    expect(result.status).toBe(422);
  });

  it('falls back to a status message', () => {
    const result = normalizeError({ response: { status: 403, data: {} } });
    expect(result.message).toMatch(/permission/i);
  });

  it('flags network failures', () => {
    const result = normalizeError({ message: 'Network Error' });
    expect(result.isNetworkError).toBe(true);
  });
});
