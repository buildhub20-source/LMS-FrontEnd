import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { HTTP_STATUS } from '../../constants/appConstants';
import { normalizeError } from '../../utils/errorUtils';
import tokenStorage from '../storage/tokenStorage';

/**
 * Refresh-token flow with request queueing: while a refresh is in flight, any
 * other 401 waits on the same promise instead of firing N parallel refreshes.
 */
let refreshPromise = null;

const forceLogout = () => {
  tokenStorage.clear();
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
};

export const onResponse = (response) => response;

export const createResponseErrorHandler = (client) => async (error) => {
  const original = error.config;
  const status = error.response?.status;

  const isRefreshCall = original?.url?.includes(API_ENDPOINTS.auth.refresh);

  if (status === HTTP_STATUS.UNAUTHORIZED && !original?._retry && !isRefreshCall) {
    original._retry = true;

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(normalizeError(error));
    }

    try {
      refreshPromise =
        refreshPromise ??
        client
          .post(API_ENDPOINTS.auth.refresh, { refreshToken })
          .then((res) => res.data)
          .finally(() => {
            refreshPromise = null;
          });

      const tokens = await refreshPromise;
      tokenStorage.setTokens(tokens);
      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return client(original);
    } catch (refreshError) {
      forceLogout();
      return Promise.reject(normalizeError(refreshError));
    }
  }

  return Promise.reject(normalizeError(error));
};
