/**
 * Frontend permission authority strings.
 * Must match the authority values used in backend @PreAuthorize annotations.
 *
 * Backend authorities (from @PreAuthorize):
 *   USER_VIEW, USER_UPDATE, USER_DELETE, USER_LOCK, USER_MANAGE_ROLES
 *   ROLES_VIEW, ROLES_MANAGE
 *   PERMISSIONS_VIEW, PERMISSIONS_MANAGE
 *   INVITATION_VIEW, INVITATION_CREATE, INVITATION_MANAGE
 */
export const PERMISSIONS = Object.freeze({
  // User management
  USER_VIEW: 'USER_VIEW',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_LOCK: 'USER_LOCK',
  USER_MANAGE_ROLES: 'USER_MANAGE_ROLES',

  // Roles
  ROLES_VIEW: 'ROLES_VIEW',
  ROLES_MANAGE: 'ROLES_MANAGE',

  // Permissions
  PERMISSIONS_VIEW: 'PERMISSIONS_VIEW',
  PERMISSIONS_MANAGE: 'PERMISSIONS_MANAGE',

  // Invitations
  INVITATION_VIEW: 'INVITATION_VIEW',
  INVITATION_CREATE: 'INVITATION_CREATE',
  INVITATION_MANAGE: 'INVITATION_MANAGE',

  // Courses — match backend @PreAuthorize strings
  COURSE_VIEW: 'COURSE_VIEW',
  COURSE_CREATE: 'COURSE_CREATE',
  COURSE_UPDATE: 'COURSE_UPDATE',
  COURSE_DELETE: 'COURSE_DELETE',
  COURSE_PUBLISH: 'COURSE_PUBLISH',
  COURSE_UNPUBLISH: 'COURSE_UNPUBLISH',
  COURSE_ARCHIVE: 'COURSE_ARCHIVE',
  COURSE_SUBMIT: 'COURSE_SUBMIT',
  COURSE_APPROVE: 'COURSE_APPROVE',
  COURSE_REJECT: 'COURSE_REJECT',
  ENROLLMENT_READ: 'enrollment:read',
  ENROLLMENT_WRITE: 'enrollment:write',
  ASSESSMENT_READ: 'assessment:read',
  ASSESSMENT_WRITE: 'assessment:write',
  ASSESSMENT_GRADE: 'assessment:grade',
  CERTIFICATE_READ: 'certificate:read',
  CERTIFICATE_ISSUE: 'certificate:issue',
  ANALYTICS_READ: 'analytics:read',
  SUBSCRIPTION_READ: 'subscription:read',
  SUBSCRIPTION_MANAGE: 'subscription:manage',
  TENANT_READ: 'tenant:read',
  TENANT_MANAGE: 'tenant:manage',

  // Legacy aliases kept for guard compatibility during transition
  USER_READ: 'USER_VIEW',
  USER_WRITE: 'USER_UPDATE',
  INVITATION_READ: 'INVITATION_VIEW',
  INVITATION_WRITE: 'INVITATION_CREATE',
});
