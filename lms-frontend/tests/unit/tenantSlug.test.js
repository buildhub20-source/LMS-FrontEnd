import { describe, expect, it } from 'vitest';

import {
  TENANT_SLUG_MAX_LENGTH,
  slugifyWorkspaceName,
  tenantSlugError,
} from '../../src/utils/tenantHostname';

describe('slugifyWorkspaceName', () => {
  it('turns a workspace name into a usable subdomain', () => {
    expect(slugifyWorkspaceName('Acme Academy')).toBe('acme-academy');
    expect(slugifyWorkspaceName('Greenwood High School')).toBe('greenwood-high-school');
  });

  it('drops apostrophes instead of splitting on them', () => {
    // st-mary-s-college would read badly as a hostname.
    expect(slugifyWorkspaceName("St. Mary's College")).toBe('st-marys-college');
    expect(slugifyWorkspaceName('St. Mary’s College')).toBe('st-marys-college');
  });

  it('folds accented letters to their base form rather than dropping them', () => {
    expect(slugifyWorkspaceName('Université Lyon')).toBe('universite-lyon');
    expect(slugifyWorkspaceName('São Paulo Institute')).toBe('sao-paulo-institute');
  });

  it('collapses runs of punctuation and trims the edges', () => {
    expect(slugifyWorkspaceName('  Spaced   Out  ')).toBe('spaced-out');
    expect(slugifyWorkspaceName('My -- School')).toBe('my-school');
    expect(slugifyWorkspaceName('***Stars***')).toBe('stars');
  });

  it('never produces a leading or trailing hyphen', () => {
    for (const name of ['-Leading', 'Trailing-', '  --odd--  ', '!!!x!!!']) {
      const slug = slugifyWorkspaceName(name);
      expect(slug.startsWith('-')).toBe(false);
      expect(slug.endsWith('-')).toBe(false);
    }
  });

  it('stays within the length limit and does not end mid-hyphen', () => {
    const slug = slugifyWorkspaceName('a'.repeat(40) + ' ' + 'b'.repeat(40));
    expect(slug.length).toBeLessThanOrEqual(TENANT_SLUG_MAX_LENGTH);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('copes with nothing usable', () => {
    expect(slugifyWorkspaceName('')).toBe('');
    expect(slugifyWorkspaceName('!!!')).toBe('');
    expect(slugifyWorkspaceName(null)).toBe('');
    expect(slugifyWorkspaceName(undefined)).toBe('');
  });

  it('suggests a slug the validator accepts', () => {
    for (const name of ['Acme Academy', "St. Mary's College", 'Université Lyon', 'My -- School']) {
      expect(tenantSlugError(slugifyWorkspaceName(name))).toBeNull();
    }
  });
});

describe('tenantSlugError', () => {
  it('accepts well-formed slugs', () => {
    for (const slug of ['lms', 'acme', 'st-marys', 'campus-one', 'a1-b2-c3', 'abc123']) {
      expect(tenantSlugError(slug)).toBeNull();
    }
  });

  it('rejects consecutive hyphens, which cannot be a hostname label', () => {
    expect(tenantSlugError('my--school')).toMatch(/single hyphens/);
  });

  it('rejects hyphens at either end', () => {
    expect(tenantSlugError('-leading')).toMatch(/single hyphens/);
    expect(tenantSlugError('trailing-')).toMatch(/single hyphens/);
  });

  it('rejects anything that is not lowercase alphanumeric or a hyphen', () => {
    expect(tenantSlugError('UPPER')).toMatch(/single hyphens/);
    expect(tenantSlugError('has space')).toMatch(/single hyphens/);
    expect(tenantSlugError('has.dot')).toMatch(/single hyphens/);
    expect(tenantSlugError('under_score')).toMatch(/single hyphens/);
  });

  it('enforces the length bounds', () => {
    expect(tenantSlugError('ab')).toMatch(/at least 3/);
    expect(tenantSlugError('abc')).toBeNull();
    expect(tenantSlugError('a'.repeat(TENANT_SLUG_MAX_LENGTH))).toBeNull();
    expect(tenantSlugError('a'.repeat(TENANT_SLUG_MAX_LENGTH + 1))).toMatch(/at most 63/);
  });

  it('asks for a value when there is none', () => {
    expect(tenantSlugError('')).toMatch(/required/);
    expect(tenantSlugError('   ')).toMatch(/required/);
    expect(tenantSlugError(null)).toMatch(/required/);
  });
});
