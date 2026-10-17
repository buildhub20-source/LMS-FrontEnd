import { HTTP_STATUS } from '../constants/appConstants';

const STATUS_MESSAGES = {
  [HTTP_STATUS.BAD_REQUEST]: 'The request was invalid.',
  [HTTP_STATUS.UNAUTHORIZED]: 'Your session has expired. Please sign in again.',
  [HTTP_STATUS.FORBIDDEN]: 'You do not have permission to perform this action.',
  [HTTP_STATUS.NOT_FOUND]: 'The requested resource was not found.',
  [HTTP_STATUS.CONFLICT]: 'This action conflicts with the current state.',
  [HTTP_STATUS.UNPROCESSABLE]: 'Some fields need your attention.',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests. Please slow down.',
  [HTTP_STATUS.SERVER_ERROR]: 'Something went wrong on our side.',
};

/** Turns any thrown value into a predictable shape the UI can render. */
export const normalizeError = (error) => {
  const status = error?.response?.status ?? 0;
  const data = error?.response?.data ?? {};

  return {
    status,
    code: data.code ?? error?.code ?? 'UNKNOWN_ERROR',
    message:
      data.message ??
      STATUS_MESSAGES[status] ??
      (error?.message === 'Network Error'
        ? 'Cannot reach the server. Check your connection.'
        : 'An unexpected error occurred.'),
    fieldErrors: data.errors ?? data.fieldErrors ?? {},
    isNetworkError: !error?.response,
    original: error,
  };
};

export const getFieldError = (error, field) => error?.fieldErrors?.[field] ?? null;

export const isAuthError = (error) =>
  error?.status === HTTP_STATUS.UNAUTHORIZED || error?.status === HTTP_STATUS.FORBIDDEN;
