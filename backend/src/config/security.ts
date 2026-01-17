import { CookieOptions } from 'express';

/**
 * Security Configuration Constants
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Cookie configuration for access token
 */
export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: isProduction, // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 15 * 60 * 1000, // 15 minutes (matches JWT expiry)
  path: '/',
};

/**
 * Cookie configuration for refresh token
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: isProduction, // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiry)
  path: '/api/auth', // Only send to auth endpoints
};

/**
 * Cookie configuration for CSRF token
 * Note: httpOnly is false so JavaScript can read it
 */
export const CSRF_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: false, // Allow JavaScript to read (needed for double-submit pattern)
  secure: isProduction, // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

/**
 * Cookie names
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  CSRF_TOKEN: 'csrf-token',
} as const;

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Content Security Policy
  CSP: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for styled-components
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
    reportOnly: !isProduction, // Report-only in development
  },

  // HTTP Strict Transport Security (HSTS)
  HSTS: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // X-Frame-Options
  FRAME_OPTIONS: 'DENY',

  // X-Content-Type-Options
  CONTENT_TYPE_OPTIONS: 'nosniff',

  // X-XSS-Protection (legacy, but still useful for older browsers)
  XSS_PROTECTION: '1; mode=block',

  // Referrer Policy
  REFERRER_POLICY: 'strict-origin-when-cross-origin',

  // Permissions Policy (formerly Feature Policy)
  PERMISSIONS_POLICY: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  // General API rate limit
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },

  // Auth endpoints rate limit (more restrictive)
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
  },

  // Comment creation rate limit
  COMMENT: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 comments per minute
  },
} as const;

/**
 * CORS configuration
 */
export const CORS_OPTIONS = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token', // Allow CSRF token header
  ],
  exposedHeaders: ['X-CSRF-Token'], // Expose CSRF token to frontend
  maxAge: 86400, // 24 hours (cache preflight requests)
};
