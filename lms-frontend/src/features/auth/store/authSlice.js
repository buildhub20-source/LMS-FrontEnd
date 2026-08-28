import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';
import tokenStorage from '../../../services/storage/tokenStorage';
import { normalizeError } from '../../../utils/errorUtils';

/**
 * Real backend LoginResponse shape (after ApiResponse unwrapping):
 * {
 *   tokens: { accessToken, refreshToken },
 *   user:   { id, name, email, roles: Set<String>, active, locked, ... },
 *   mustChangePassword: boolean
 * }
 *
 * CurrentUserResponse shape (after ApiResponse unwrapping):
 * {
 *   user:        { id, name, email, ... },
 *   roles:       Set<String>,
 *   permissions: Set<String>
 * }
 */

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // Real backend call — response is LoginResponse { tokens, user, mustChangePassword }
    const data = await authService.login(credentials);
    tokenStorage.setTokens(data.tokens);

    // Merge backend user + roles/permissions from the user object
    const user = {
      ...data.user,
      fullName: data.user?.name,
      // The LoginResponse.user carries roles as Set<String> directly
      roles: Array.isArray(data.user?.roles) ? data.user.roles : [...(data.user?.roles ?? [])],
      mustChangePassword: data.mustChangePassword ?? false,
    };
    return user;
  } catch (error) {
    if (import.meta.env.DEV) {
      // If backend is down, give a helpful message
      const msg =
        error?.code === 'ERR_NETWORK'
          ? 'Backend offline. In development, use email: admin@123 / password: admin'
          : (error?.message ?? 'Invalid credentials');
      return rejectWithValue({ message: msg });
    }
    return rejectWithValue(normalizeError(error));
  }
});

export const loadSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    if (!tokenStorage.getAccessToken()) return null;

    // Real backend — GET /auth/me → CurrentUserResponse { user, roles, permissions }
    const data = await authService.getCurrentUser();
    return {
      ...data.user,
      fullName: data.user?.name,
      roles: Array.isArray(data.roles) ? data.roles : [...(data.roles ?? [])],
      permissions: Array.isArray(data.permissions)
        ? data.permissions
        : [...(data.permissions ?? [])],
      mustChangePassword: false, // If they can call /auth/me they've already set their password
    };
  } catch (error) {
    tokenStorage.clear();
    return rejectWithValue(normalizeError(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  try {
    const refreshToken = tokenStorage.getRefreshToken();
    await authService.logout(refreshToken ? { refreshToken } : undefined);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend offline during logout. Cleared session client-side.');
    }
  } finally {
    tokenStorage.clear();
  }
});

/**
 * Accepts the magic-link invitation token.
 * On success the backend returns a full LoginResponse, so the user
 * is immediately authenticated — no separate login step needed.
 */
export const acceptInvitation = createAsyncThunk(
  'auth/acceptInvitation',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const data = await authService.acceptInvitation({ token, newPassword });
      tokenStorage.setTokens(data.tokens);
      return {
        ...data.user,
        fullName: data.user?.name,
        roles: Array.isArray(data.user?.roles) ? data.user.roles : [...(data.user?.roles ?? [])],
        permissions: Array.isArray(data.user?.permissions)
          ? data.user.permissions
          : [...(data.user?.permissions ?? [])],
        mustChangePassword: false,
      };
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  status: 'idle', // idle | loading | authenticated | unauthenticated
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    passwordChanged(state) {
      if (state.user) state.user.mustChangePassword = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? null;
      })
      .addCase(loadSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'authenticated' : 'unauthenticated';
      })
      .addCase(loadSession.rejected, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      })
      .addCase(acceptInvitation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? null;
      });
  },
});

export const { sessionExpired, clearAuthError, passwordChanged } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated';
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectMustChangePassword = (state) => state.auth.user?.mustChangePassword === true;

export default authSlice.reducer;
