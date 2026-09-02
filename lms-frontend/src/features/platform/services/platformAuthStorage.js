import { STORAGE_KEYS } from '../../../constants/appConstants';

const key = STORAGE_KEYS.PLATFORM_ACCESS_TOKEN;

export const platformAuthStorage = {
  getToken: () => window.sessionStorage.getItem(key),
  setToken: (token) => window.sessionStorage.setItem(key, token),
  clear: () => window.sessionStorage.removeItem(key),
};

export default platformAuthStorage;
