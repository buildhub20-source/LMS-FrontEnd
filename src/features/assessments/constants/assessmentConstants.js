export const QUESTION_TYPES = Object.freeze({
  SINGLE_CHOICE: 'SINGLE_CHOICE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FREE_TEXT: 'FREE_TEXT',
});

export const QUESTION_TYPE_OPTIONS = Object.values(QUESTION_TYPES).map((type) => ({
  value: type,
  label: type.replace('_', ' ').toLowerCase(),
}));

export const ATTEMPT_STATUS = Object.freeze({
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
  EXPIRED: 'EXPIRED',
});
