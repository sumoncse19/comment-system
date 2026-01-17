/**
 * Security Configuration
 *
 * Centralizes security-related constants and configurations
 */

/**
 * Storage keys
 * ✅ TOKENS NOW IN HTTPONLY COOKIES (SECURE)
 * - Access token: httpOnly cookie
 * - Refresh token: httpOnly cookie
 * - Only user data and theme stored in localStorage
 */
export const STORAGE_KEYS = {
  USER: 'user',
  THEME: 'vite-ui-theme',
} as const;

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  // Token refresh buffer (refresh before expiry)
  REFRESH_BUFFER_MS: 60000, // 1 minute

  // Maximum retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,

  // Timeout for authentication requests
  AUTH_TIMEOUT_MS: 10000, // 10 seconds
} as const;

/**
 * Security headers that should be present in API responses
 * Use this to validate backend security configuration
 */
export const EXPECTED_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

/**
 * Content Security Policy directives
 * These should be implemented on the backend
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", import.meta.env.VITE_API_URL || 'http://localhost:5000'],
} as const;

/**
 * Clear all authentication data from storage
 * Use this on logout or auth failure
 * Note: Tokens are in httpOnly cookies and cleared by backend
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Tokens are in httpOnly cookies and will be cleared by backend on logout
  // or automatically expire
};

/**
 * Security best practices checklist for implementation:
 *
 * ✅ IMPLEMENTED:
 * - Token refresh race condition prevention
 * - Request retry with token refresh
 * - Automatic redirect on auth failure
 * - Centralized auth data management
 * - ✅ HttpOnly cookies for tokens (XSS protection)
 * - ✅ CSRF token protection (double-submit pattern)
 * - ✅ Secure cookie flags (secure, sameSite)
 * - ✅ Content Security Policy headers
 * - ✅ Comprehensive security headers (HSTS, X-Frame-Options, etc.)
 * - ✅ Rate limiting on auth endpoints
 * - ✅ withCredentials for cookie-based auth
 *
 * 🔒 RECOMMENDED (Future Enhancements):
 * - Add request/response logging for security audit
 * - Implement token expiry client-side validation
 * - Add biometric authentication support
 * - Implement device fingerprinting
 * - Add suspicious activity detection
 * - Add two-factor authentication (2FA)
 * - Implement session management (view/revoke active sessions)
 */
