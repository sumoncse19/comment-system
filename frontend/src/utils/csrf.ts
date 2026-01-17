/**
 * CSRF Token Utility
 *
 * Stores CSRF token in memory (received from login/register response)
 * This is accessible by axios interceptor for sending with requests
 */

// In-memory storage for CSRF token
let csrfToken: string | null = null;

/**
 * Set CSRF token (called after login/register)
 */
export const setCsrfToken = (token: string | null): void => {
  csrfToken = token;
};

/**
 * Get CSRF token from memory
 */
export const getCsrfToken = (): string | null => {
  return csrfToken;
};

/**
 * Clear CSRF token (called on logout)
 */
export const clearCsrfToken = (): void => {
  csrfToken = null;
};

/**
 * Check if CSRF token exists
 */
export const hasCsrfToken = (): boolean => {
  return csrfToken !== null;
};
