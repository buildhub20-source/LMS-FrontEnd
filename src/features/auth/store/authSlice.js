import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';
import tokenStorage from '../../../services/storage/tokenStorage';
import { normalizeError } from '../../../utils/errorUtils';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    if (import.meta.env.DEV) {
      if (credentials.email === 'admin@123' && credentials.password === 'admin') {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockUser = {
          id: 'dev-admin',
          firstName: 'Dev',
          lastName: 'Admin',
          fullName: 'Dev Admin',
          email: 'admin@123',
          roles: ['ADMIN', 'SUPER_ADMIN'],
          permissions: [
            'user:read', 'user:write', 'user:delete',
            'role:read', 'role:write',
            'invitation:read', 'invitation:write',
            'course:read', 'course:write', 'course:publish', 'course:delete',
            'enrollment:read', 'enrollment:write',
            'assessment:read', 'assessment:write', 'assessment:grade',
            'certificate:read', 'certificate:issue',
            'analytics:read',
            'subscription:read', 'subscription:manage',
            'tenant:read', 'tenant:manage'
          ]
        };
        tokenStorage.setTokens({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' });
        return mockUser;
      } else {
        // Fallback to real auth, or fail if backend is down
        try {
          const data = await authService.login(credentials);
          tokenStorage.setTokens(data);
          return data.user;
        } catch (err) {
          return rejectWithValue({ message: 'Invalid credentials. In development, use email: admin@123 and password: admin.' });
        }
      }
    }
    const data = await authService.login(credentials);
    tokenStorage.setTokens(data);
    return data.user;
  } catch (error) {
    return rejectWithValue(normalizeError(error));
  }
});

export const loadSession = createAsyncThunk('auth/loadSession', async (_, { rejectWithValue }) => {
  try {
    if (!tokenStorage.getAccessToken()) {
      return null;
    }
    // If it's a mock token from a previous dev session, return mock admin user
    if (import.meta.env.DEV && tokenStorage.getAccessToken() === 'mock-access-token') {
      return {
        id: 'dev-admin',
        firstName: 'Dev',
        lastName: 'Admin',
        fullName: 'Dev Admin',
        email: 'admin@123',
        roles: ['ADMIN', 'SUPER_ADMIN'],
        permissions: [
          'user:read', 'user:write', 'user:delete',
          'role:read', 'role:write',
          'invitation:read', 'invitation:write',
          'course:read', 'course:write', 'course:publish', 'course:delete',
          'enrollment:read', 'enrollment:write',
          'assessment:read', 'assessment:write', 'assessment:grade',
          'certificate:read', 'certificate:issue',
          'analytics:read',
          'subscription:read', 'subscription:manage',
          'tenant:read', 'tenant:manage'
        ]
      };
    }
    return await authService.getCurrentUser();
  } catch (error) {
    if (import.meta.env.DEV) {
      if (tokenStorage.getAccessToken() === 'mock-access-token') {
        return {
          id: 'dev-admin',
          firstName: 'Dev',
          lastName: 'Admin',
          fullName: 'Dev Admin',
          email: 'admin@123',
          roles: ['ADMIN', 'SUPER_ADMIN'],
          permissions: [
            'user:read', 'user:write', 'user:delete',
            'role:read', 'role:write',
            'invitation:read', 'invitation:write',
            'course:read', 'course:write', 'course:publish', 'course:delete',
            'enrollment:read', 'enrollment:write',
            'assessment:read', 'assessment:write', 'assessment:grade',
            'certificate:read', 'certificate:issue',
            'analytics:read',
            'subscription:read', 'subscription:manage',
            'tenant:read', 'tenant:manage'
          ]
        };
      }
    }
    tokenStorage.clear();
    return rejectWithValue(normalizeError(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authService.logout();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend offline during logout. Cleared session client-side.');
      return;
    }
    throw error;
  } finally {
    tokenStorage.clear();
  }
});

const initialState = {
  user: null,
  status: 'idle',
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
      });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated';
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
