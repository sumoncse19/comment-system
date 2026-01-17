/**
 * CSRF Token Utility
 *
 * Handles reading CSRF token from cookies for double-submit pattern
 */

/**
 * Get CSRF token from cookie
 * The backend sets this cookie (httpOnly=false so JS can read it)
 */
export const getCsrfToken = (): string | null => {
  const name = 'csrf-token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return null;
};

/**
 * Check if CSRF token exists in cookies
 */
export const hasCsrfToken = (): boolean => {
  return getCsrfToken() !== null;
};
