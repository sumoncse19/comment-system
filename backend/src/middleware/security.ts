import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { generateSignedCsrfToken, verifyCsrfToken, compareCsrfTokens } from '../utils/csrf';
import { COOKIE_NAMES, CSRF_TOKEN_COOKIE_OPTIONS, SECURITY_HEADERS } from '../config/security';
import { ApiError } from '../utils/ApiError';

// Helmet middleware for security headers with custom configuration
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      ...SECURITY_HEADERS.CSP.directives,
    },
    reportOnly: SECURITY_HEADERS.CSP.reportOnly,
  },
  hsts: {
    maxAge: SECURITY_HEADERS.HSTS.maxAge,
    includeSubDomains: SECURITY_HEADERS.HSTS.includeSubDomains,
    preload: SECURITY_HEADERS.HSTS.preload,
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: {
    policy: SECURITY_HEADERS.REFERRER_POLICY,
  },
});

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'TOO_MANY_REQUESTS',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth routes (login, register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes',
      code: 'TOO_MANY_REQUESTS',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Simple XSS protection middleware
export const xssProtection = (req: Request, _res: Response, next: NextFunction): void => {
  // Basic sanitization for string values in body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        // Remove potential script tags and event handlers
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      }
    });
  }
  next();
};

// NoSQL Injection protection
export const noSqlInjectionProtection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Remove $ and . from keys to prevent NoSQL injection
  const sanitize = (obj: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};
    Object.keys(obj).forEach((key) => {
      if (!key.startsWith('$') && !key.includes('.')) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          sanitized[key] = sanitize(obj[key] as Record<string, unknown>);
        } else {
          sanitized[key] = obj[key];
        }
      }
    });
    return sanitized;
  };

  // Only sanitize req.body (req.query is read-only in Express 5)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }

  next();
};

/**
 * CSRF Token Generation Middleware
 * Generates and sets CSRF token cookie for GET requests
 */
export const csrfTokenGenerator = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only generate token for GET requests or if token doesn't exist
  if (req.method === 'GET' || !req.cookies[COOKIE_NAMES.CSRF_TOKEN]) {
    const csrfToken = generateSignedCsrfToken();

    // Set CSRF token cookie (httpOnly=false so JS can read it)
    res.cookie(COOKIE_NAMES.CSRF_TOKEN, csrfToken, CSRF_TOKEN_COOKIE_OPTIONS);

    // Also send in response header for initial page load
    res.setHeader('X-CSRF-Token', csrfToken);
  }

  next();
};

/**
 * CSRF Protection Middleware
 * Validates CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
 */
export const csrfProtection = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for authentication routes (login, register, refresh-token)
  // These are protected by rate limiting instead
  const authRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];
  if (authRoutes.includes(req.path)) {
    return next();
  }

  // Get CSRF token from cookie
  const cookieToken = req.cookies[COOKIE_NAMES.CSRF_TOKEN];

  // Get CSRF token from header
  const headerToken = req.headers['x-csrf-token'] as string;

  // Check if both tokens exist
  if (!cookieToken || !headerToken) {
    return next(ApiError.forbidden('CSRF token missing'));
  }

  // Verify cookie token signature
  if (!verifyCsrfToken(cookieToken)) {
    return next(ApiError.forbidden('Invalid CSRF token'));
  }

  // Compare tokens (double-submit pattern)
  if (!compareCsrfTokens(cookieToken, headerToken)) {
    return next(ApiError.forbidden('CSRF token mismatch'));
  }

  next();
};

/**
 * Additional Security Headers Middleware
 */
export const additionalSecurityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Permissions Policy (formerly Feature Policy)
  const permissionsPolicy = Object.entries(SECURITY_HEADERS.PERMISSIONS_POLICY)
    .map(([feature, allowlist]) => {
      const sources = Array.isArray(allowlist) && allowlist.length > 0
        ? allowlist.join(' ')
        : '()';
      return `${feature}=${sources}`;
    })
    .join(', ');

  res.setHeader('Permissions-Policy', permissionsPolicy);

  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Clear-Site-Data header for logout (will be set in logout endpoint)
  // res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');

  next();
};
