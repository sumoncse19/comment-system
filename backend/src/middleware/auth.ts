import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import authService from '../services/authService';
import { COOKIE_NAMES } from '../config/security';

// Protect routes - require authentication
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // PRIORITY 1: Try to get token from httpOnly cookie (SECURE)
    token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    // FALLBACK: Check Authorization header for backward compatibility
    // This allows gradual migration from localStorage to cookies
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // If no token found in either location, deny access
    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided');
    }

    // Verify token
    const decoded = authService.verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth - attach user if token exists, but don't require it
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // PRIORITY 1: Try to get token from httpOnly cookie (SECURE)
    token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    // FALLBACK: Check Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // If token exists, try to verify it
    if (token) {
      try {
        const decoded = authService.verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
        };
      } catch {
        // Token invalid, but we don't throw - just continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default { protect, optionalAuth };
