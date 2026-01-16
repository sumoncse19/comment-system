import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Helmet middleware for security headers
export const helmetMiddleware = helmet();

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
