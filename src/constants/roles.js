export const ROLES = Object.freeze({
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
});

export const ROLE_LABELS = Object.freeze({
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.INSTRUCTOR]: 'Instructor',
  [ROLES.STUDENT]: 'Student',
});

export const ROLE_HOME_ROUTE = Object.freeze({
  [ROLES.SUPER_ADMIN]: '/admin/analytics',
  [ROLES.ADMIN]: '/admin/analytics',
  [ROLES.INSTRUCTOR]: '/instructor/courses',
  [ROLES.STUDENT]: '/learn/my-courses',
});
