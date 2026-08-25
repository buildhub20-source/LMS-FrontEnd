export const COURSE_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

export const COURSE_STATUS_TONE = Object.freeze({
  [COURSE_STATUS.DRAFT]: 'neutral',
  [COURSE_STATUS.PENDING_REVIEW]: 'warning',
  [COURSE_STATUS.PUBLISHED]: 'success',
  [COURSE_STATUS.UNPUBLISHED]: 'info',
  [COURSE_STATUS.ARCHIVED]: 'danger',
});

export const COURSE_LEVELS = Object.freeze({
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
});

export const COURSE_LEVEL_OPTIONS = Object.values(COURSE_LEVELS).map((level) => ({
  value: level,
  label: level.charAt(0) + level.slice(1).toLowerCase(),
}));

export const COURSE_STATUS_OPTIONS = Object.values(COURSE_STATUS).map((status) => ({
  value: status,
  label: status.replace(/_/g, ' ').toLowerCase(),
}));
