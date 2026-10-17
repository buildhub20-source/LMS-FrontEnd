export const COURSE_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  IN_REVIEW: 'IN_REVIEW',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
});

export const COURSE_STATUS_TONE = Object.freeze({
  [COURSE_STATUS.DRAFT]: 'neutral',
  [COURSE_STATUS.IN_REVIEW]: 'warning',
  [COURSE_STATUS.PUBLISHED]: 'success',
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
  label: status.replace('_', ' ').toLowerCase(),
}));
