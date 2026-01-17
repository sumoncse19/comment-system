import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearAuthData } from '../config/security';
import { getCsrfToken } from '../utils/csrf';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests (httpOnly cookies for auth)
});

// Token refresh state management to prevent race conditions
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Subscribe to token refresh completion
 * This ensures multiple concurrent 401s wait for a single refresh
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all waiting requests that token refresh is complete
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Clear all refresh subscribers (called on refresh failure)
 */
const clearRefreshSubscribers = () => {
  refreshSubscribers = [];
};

/**
 * Request interceptor
 * - Adds CSRF token to state-changing requests (POST, PUT, DELETE, PATCH)
 * - Tokens are now sent via httpOnly cookies automatically (no Authorization header needed)
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token for state-changing requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle token refresh with race condition prevention
 * Tokens are now managed via httpOnly cookies, so no localStorage manipulation
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            // Retry the request (cookies will be sent automatically)
            resolve(api(originalRequest));
          });
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        // Try to refresh the token
        // Refresh token is sent automatically via httpOnly cookie
        await axios.post(
          `${API_URL}/auth/refresh-token`,
          {}, // Empty body
          { withCredentials: true } // Send cookies
        );

        // Notify all waiting requests that refresh is complete
        onTokenRefreshed('refreshed'); // Token value doesn't matter, it's in cookies

        // Retry the original request (new cookies will be sent automatically)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear all subscribers
        clearRefreshSubscribers();
        clearAuthData(); // This now only clears user data from localStorage
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        // Reset refresh state
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
