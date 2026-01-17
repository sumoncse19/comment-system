import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, RegisterCredentials } from '../../types';
import { authApi } from '../../api/authApi';
import { STORAGE_KEYS, clearAuthData } from '../../config/security';
import { setCsrfToken, clearCsrfToken } from '../../utils/csrf';
import type { AxiosError } from 'axios';

/**
 * Auth State Interface
 */
interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial State
 */
const initialState: AuthState = {
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with true for initial auth check
  error: null,
};

/**
 * Async Thunks for Auth Actions
 */

// Initialize auth - Check if user is already logged in
export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  try {
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedUser) {
      // Verify token is still valid (cookie sent automatically)
      const response = await authApi.getMe();
      const { user, csrfToken } = response.data;

      // Restore CSRF token in memory for subsequent requests
      setCsrfToken(csrfToken);

      return { user, csrfToken };
    }

    return null;
  } catch (error) {
    // Token invalid or expired - clear user data
    clearAuthData();
    return rejectWithValue('Session expired');
  }
});

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      const { user, csrfToken } = response.data;

      // Store user data only (tokens are in httpOnly cookies)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Store CSRF token in memory for axios interceptor
      setCsrfToken(csrfToken);

      return { user, csrfToken };
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      const message = error.response?.data?.error?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.register(credentials);
      const { user, csrfToken } = response.data;

      // Store user data only (tokens are in httpOnly cookies)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      // Store CSRF token in memory for axios interceptor
      setCsrfToken(csrfToken);

      return { user, csrfToken };
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string; details?: Record<string, string> } }>;
      const message = error.response?.data?.error?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
    clearAuthData();
    clearCsrfToken();
    return null;
  } catch (error) {
    // Log logout errors for debugging but don't block logout
    console.error('Logout API call failed:', error);
    clearAuthData();
    clearCsrfToken();
    return null;
  }
});

/**
 * Auth Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set user (for manual updates)
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Initialize Auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.csrfToken = action.payload.csrfToken;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.csrfToken = null;
          state.isAuthenticated = false;
        }
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.csrfToken = action.payload.csrfToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.csrfToken = action.payload.csrfToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear local state
        state.isLoading = false;
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

// Export actions
export const { clearError, setUser } = authSlice.actions;

// Export reducer
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCsrfToken = (state: { auth: AuthState }) => state.auth.csrfToken;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
