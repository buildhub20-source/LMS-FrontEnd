/** Every path in the app lives here - never hardcode a route string elsewhere. */
export const ROUTES = Object.freeze({
  ROOT: '/',

  // Auth
  LOGIN: '/auth/login',
  ACCEPT_INVITATION: '/auth/accept-invitation',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  SET_PASSWORD: '/auth/set-password',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',


  // Admin
  ADMIN_ANALYTICS: '/admin/analytics',
  USERS: '/admin/users',
  USER_CREATE: '/admin/users/new',
  USER_DETAILS: (id = ':userId') => `/admin/users/${id}`,
  USER_EDIT: (id = ':userId') => `/admin/users/${id}/edit`,
  ROLES: '/admin/roles',
  ROLE_DETAILS: (id = ':roleId') => `/admin/roles/${id}`,
  PERMISSIONS: '/admin/permissions',
  INVITATIONS: '/admin/invitations',
  ENROLLMENTS: '/admin/enrollments',
  ENROLLMENT_DETAILS: (id = ':enrollmentId') => `/admin/enrollments/${id}`,
  ORGANIZATION: '/admin/organization',
  ORGANIZATION_SETTINGS: '/admin/organization/settings',
  SUBSCRIPTION: '/admin/subscription',
  PLANS: '/admin/subscription/plans',
  BILLING: '/admin/subscription/billing',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_COURSE_CREATE: '/admin/courses/new',
  ADMIN_COURSE_DETAILS: (id = ':courseId') => `/admin/courses/${id}`,
  ADMIN_COURSE_EDIT: (id = ':courseId') => `/admin/courses/${id}/edit`,

  // Admin Assessments
  ADMIN_ASSESSMENTS: '/admin/assessments',
  ADMIN_ASSESSMENT_CREATE: '/admin/assessments/new',
  ADMIN_ASSESSMENT_DETAILS: (id = ':assessmentId') => `/admin/assessments/${id}`,
  ADMIN_ASSESSMENT_EDIT: (id = ':assessmentId') => `/admin/assessments/${id}/edit`,

  // Instructor
  INSTRUCTOR_ANALYTICS: '/instructor/analytics',
  COURSES: '/instructor/courses',
  COURSE_CREATE: '/instructor/courses/new',
  COURSE_DETAILS: (id = ':courseId') => `/instructor/courses/${id}`,
  COURSE_EDIT: (id = ':courseId') => `/instructor/courses/${id}/edit`,
  ASSESSMENTS: '/instructor/assessments',
  ASSESSMENT_CREATE: '/instructor/assessments/new',
  INSTRUCTOR_ENROLLMENTS: '/instructor/enrollments',

  // Student
  MY_COURSES: '/learn/my-courses',
  MY_ENROLLMENTS: '/learn/enrollments',
  LEARNING: (id = ':courseId') => `/learn/${id}`,
  LESSON: (c = ':courseId', l = ':lessonId') => `/learn/${c}/lessons/${l}`,
  COURSE_PLAYER: (id = ':courseId') => `/learn/${id}/player`,
  ASSESSMENT_ATTEMPT: (id = ':assessmentId') => `/learn/assessments/${id}`,
  ASSESSMENT_RESULT: (id = ':attemptId') => `/learn/assessments/results/${id}`,
  STUDENT_PROGRESS: '/learn/progress',
  CERTIFICATES: '/learn/certificates',
  CERTIFICATE_DETAILS: (id = ':certificateId') => `/learn/certificates/${id}`,

  // Shared
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SECURITY: '/profile/security',
});
