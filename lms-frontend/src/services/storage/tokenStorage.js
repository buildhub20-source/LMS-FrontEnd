import { STORAGE_KEYS } from '../../constants/appConstants';
import storage from './localStorage';

/**
 * SECURITY NOTE
 * -------------
 * Access token: kept in-memory only (module-level variable). Never written to
 * any persistent storage, so it is cleared on page reload; the session is then
 * restored from the refresh token.
 *
 * Refresh token: sessionStorage by default (tab-scoped, cleared when the tab is
 * closed). When the user ticks "Remember for 30 days" it goes to localStorage
 * instead, so it survives closing the browser. Both are JS-accessible; for full
 * XSS protection, migrate to httpOnly + Secure + SameSite=Strict cookies issued
 * by the API server.
 *
 * This module centralises access so that swapping the strategy touches exactly one file.
 */
let accessTokenInMemory = null;

const REFRESH_KEY = STORAGE_KEYS.REFRESH_TOKEN;

const read = (store) => {
  try {
    return store.getItem(REFRESH_KEY);
  } catch {
    return null; // storage unavailable (e.g. private mode with storage disabled)
  }
};

const write = (store, token) => {
  try {
    if (token == null) store.removeItem(REFRESH_KEY);
    else store.setItem(REFRESH_KEY, token);
  } catch {
    // storage unavailable
  }
};

export const tokenStorage = {
  getAccessToken() {
    return accessTokenInMemory;
  },

  setAccessToken(token) {
    accessTokenInMemory = token;
  },

  getRefreshToken() {
    return read(sessionStorage) ?? read(localStorage);
  },

  /**
   * @param {string|null} token
   * @param {{ persist?: boolean }} [options] persist=true keeps it across browser
   *   restarts ("Remember me"). Omitted (e.g. on token rotation) keeps the
   *   current choice.
   */
  setRefreshToken(token, { persist } = {}) {
    const keep = persist ?? read(localStorage) != null;
    write(keep ? localStorage : sessionStorage, token);
    write(keep ? sessionStorage : localStorage, null);
  },

  setTokens({ accessToken, refreshToken } = {}, options) {
    if (accessToken) tokenStorage.setAccessToken(accessToken);
    if (refreshToken) tokenStorage.setRefreshToken(refreshToken, options);
  },

  clear() {
    accessTokenInMemory = null;
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN); // clean up any legacy localStorage entry
    write(sessionStorage, null);
    write(localStorage, null);
  },
};

export default tokenStorage;
