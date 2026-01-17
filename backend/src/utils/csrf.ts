import crypto from 'crypto';

/**
 * CSRF Token Utility
 *
 * Implements double-submit cookie pattern for CSRF protection
 * - Token stored in cookie (httpOnly=false for JS access)
 * - Same token sent in custom header for verification
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

/**
 * Generate a signed CSRF token
 * This prevents token forgery by signing the token with a secret
 */
export const generateSignedCsrfToken = (): string => {
  const token = generateCsrfToken();
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');

  return `${token}.${signature}`;
};

/**
 * Verify a signed CSRF token
 */
export const verifyCsrfToken = (signedToken: string): boolean => {
  try {
    const [token, signature] = signedToken.split('.');

    if (!token || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(token)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
};

/**
 * Check if two CSRF tokens match (constant-time comparison)
 */
export const compareCsrfTokens = (token1: string, token2: string): boolean => {
  try {
    if (!token1 || !token2 || token1.length !== token2.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(token1),
      Buffer.from(token2)
    );
  } catch (error) {
    return false;
  }
};
