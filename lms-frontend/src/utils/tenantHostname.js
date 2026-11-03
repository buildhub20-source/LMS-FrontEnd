const normalize = (value) => value?.trim().toLowerCase().replace(/\.$/, '') ?? '';

const configuredBaseDomain = () => normalize(import.meta.env.VITE_TENANT_BASE_DOMAIN);

/** Domain workspace subdomains hang off; localhost in development. */
export const workspaceBaseDomain = () => configuredBaseDomain() || 'localhost';

/**
 * Resolves a tenant from its workspace hostname. Local development uses
 * <tenant>.localhost and deployment uses <tenant>.<VITE_TENANT_BASE_DOMAIN>.
 */
export const tenantSlugFromHostname = (hostname = window.location.hostname) => {
  const host = normalize(hostname);
  const baseDomain = configuredBaseDomain();
  const suffix = baseDomain ? `.${baseDomain}` : '.localhost';

  if (!host.endsWith(suffix)) return null;
  const slug = host.slice(0, -suffix.length);
  return slug && !slug.includes('.') && slug !== 'platform' ? slug : null;
};

/** The platform control plane is intentionally isolated from tenant workspaces. */
export const isPlatformHostname = (hostname = window.location.hostname) => {
  const host = normalize(hostname);
  const baseDomain = configuredBaseDomain() || 'localhost';
  return host === `platform.${baseDomain}` || window.location.pathname.startsWith('/platform');
};

/**
 * Slug rules, mirroring TenantSlug on the backend: lowercase alphanumeric
 * groups joined by single hyphens, 3-63 characters. The slug becomes the
 * workspace subdomain, so it has to be a legal hostname label.
 *
 * Kept in step with the server by hand. The server stays authoritative — this
 * only saves a round trip to learn what it would have said. The reserved-label
 * list is deliberately NOT duplicated here: it is a business rule that will
 * change, and a stale copy would reject a slug the server would allow.
 */
export const TENANT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const TENANT_SLUG_MIN_LENGTH = 3;
export const TENANT_SLUG_MAX_LENGTH = 63;

/**
 * Suggests a slug from a workspace name: "St. Mary's College" -> "st-marys-college".
 *
 * Accented letters are folded to their base form so that a name like
 * "Universite Lyon" does not lose characters silently.
 */
export const slugifyWorkspaceName = (name) =>
  (name ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    // Apostrophes are dropped rather than treated as separators, so
    // "St. Mary's College" becomes st-marys-college and not st-mary-s-college.
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, TENANT_SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');

/** The reason a slug is unusable, or null when it is fine. */
export const tenantSlugError = (slug) => {
  const value = (slug ?? '').trim();
  if (!value) return 'A slug is required.';
  if (value.length < TENANT_SLUG_MIN_LENGTH) {
    return `Use at least ${TENANT_SLUG_MIN_LENGTH} characters.`;
  }
  if (value.length > TENANT_SLUG_MAX_LENGTH) {
    return `Use at most ${TENANT_SLUG_MAX_LENGTH} characters.`;
  }
  if (!TENANT_SLUG_PATTERN.test(value)) {
    return 'Use lowercase letters, numbers and single hyphens, starting and ending with a letter or number.';
  }
  return null;
};
