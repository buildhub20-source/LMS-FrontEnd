import tokenStorage from '../storage/tokenStorage';
import storage from '../storage/localStorage';
import { STORAGE_KEYS } from '../../constants/appConstants';

/** Attaches auth, tenant and correlation headers to every outgoing request. */
export const onRequest = (config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const tenant = storage.get(STORAGE_KEYS.TENANT);
  if (tenant?.id) {
    config.headers['X-Tenant-Id'] = tenant.id;
  }

  config.headers['X-Request-Id'] = crypto.randomUUID();
  return config;
};

export const onRequestError = (error) => Promise.reject(error);
