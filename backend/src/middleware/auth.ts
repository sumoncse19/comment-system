import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ApiError } from '../utils/ApiError';
import authService from '../services/authService';

// Protect routes - require authentication
export const protect = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided');
    }

    const token = authHeader.split(' ')[1];

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
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

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
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default { protect, optionalAuth };
