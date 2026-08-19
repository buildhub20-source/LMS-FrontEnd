import axios from 'axios';
import environment from '../../config/environment';
import appConfig from '../../config/appConfig';
import { onRequest, onRequestError } from './requestInterceptor';
import { onResponse, createResponseErrorHandler } from './responseInterceptor';

export const apiClient = axios.create({
  baseURL: environment.apiBaseUrl,
  timeout: appConfig.requestTimeoutMs,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(onRequest, onRequestError);
apiClient.interceptors.response.use(onResponse, createResponseErrorHandler(apiClient));

/** Unwraps `response.data` so services stay free of axios specifics. */
export const http = {
  get: (url, config) => apiClient.get(url, config).then((r) => r.data),
  post: (url, body, config) => apiClient.post(url, body, config).then((r) => r.data),
  put: (url, body, config) => apiClient.put(url, body, config).then((r) => r.data),
  patch: (url, body, config) => apiClient.patch(url, body, config).then((r) => r.data),
  delete: (url, config) => apiClient.delete(url, config).then((r) => r.data),
};

export default apiClient;
