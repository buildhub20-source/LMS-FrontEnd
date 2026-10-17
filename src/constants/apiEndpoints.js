/** Path fragments appended to environment.apiBaseUrl by the axios instance. */
export const API_ENDPOINTS = Object.freeze({
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    acceptInvitation: '/auth/accept-invitation',
  },
  users: {
    base: '/users',
    byId: (id) => `/users/${id}`,
    status: (id) => `/users/${id}/status`,
    activate: (id) => `/users/${id}/activate`,
    deactivate: (id) => `/users/${id}/deactivate`,
    lock: (id) => `/users/${id}/lock`,
    unlock: (id) => `/users/${id}/unlock`,
    statusHistory: (id) => `/users/${id}/status-history`,
    roles: (id) => `/users/${id}/roles`,
  },
  roles: {
    base: '/roles',
    byId: (id) => `/roles/${id}`,
    permissions: '/roles/permissions',
  },
  invitations: {
    base: '/invitations',
    byId: (id) => `/invitations/${id}`,
    resend: (id) => `/invitations/${id}/resend`,
  },
  courses: {
    base: '/courses',
    byId: (id) => `/courses/${id}`,
    publish: (id) => `/courses/${id}/publish`,
    thumbnail: (id) => `/courses/${id}/thumbnail`,
    mine: '/courses/mine',
  },
  enrollments: {
    base: '/enrollments',
    byId: (id) => `/enrollments/${id}`,
    mine: '/enrollments/mine',
  },
  learning: {
    course: (courseId) => `/learning/courses/${courseId}`,
    lesson: (courseId, lessonId) => `/learning/courses/${courseId}/lessons/${lessonId}`,
    progress: (courseId) => `/learning/courses/${courseId}/progress`,
  },
  assessments: {
    base: '/assessments',
    byId: (id) => `/assessments/${id}`,
    attempts: (id) => `/assessments/${id}/attempts`,
    submit: (attemptId) => `/assessments/attempts/${attemptId}/submit`,
    result: (attemptId) => `/assessments/attempts/${attemptId}/result`,
  },
  certificates: {
    base: '/certificates',
    byId: (id) => `/certificates/${id}`,
    download: (id) => `/certificates/${id}/download`,
  },
  notifications: {
    base: '/notifications',
    read: (id) => `/notifications/${id}/read`,
    readAll: '/notifications/read-all',
  },
  analytics: {
    admin: '/analytics/admin',
    instructor: '/analytics/instructor',
    studentProgress: '/analytics/progress',
  },
  subscriptions: {
    current: '/subscriptions/current',
    plans: '/subscriptions/plans',
    billingHistory: '/subscriptions/billing',
  },
  tenants: {
    current: '/tenants/current',
    settings: '/tenants/current/settings',
    branding: '/tenants/current/branding',
  },
  profile: {
    base: '/profile',
    avatar: '/profile/avatar',
    changePassword: '/profile/change-password',
  },
  permissions: {
    base: '/permissions',
    byId: (id) => `/permissions/${id}`,
  },
});

