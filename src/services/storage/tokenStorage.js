import { STORAGE_KEYS } from '../../constants/appConstants';
import storage from './localStorage';

/**
 * SECURITY NOTE
 * -------------
 * Storing tokens in localStorage exposes them to XSS. For production, prefer
 * httpOnly + Secure + SameSite cookies issued by the API, and keep only the
 * in-memory access token here. This module centralises access so that swapping
 * the strategy touches exactly one file.
 */
let accessTokenInMemory = null;

export const tokenStorage = {
  getAccessToken() {
    return accessTokenInMemory ?? storage.get(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken(token) {
    accessTokenInMemory = token;
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getRefreshToken() {
    return storage.get(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(token) {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  setTokens({ accessToken, refreshToken }) {
    if (accessToken) tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
  },

  clear() {
    accessTokenInMemory = null;
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default tokenStorage;
