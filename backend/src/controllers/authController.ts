import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { sendSuccess } from '../utils/helpers';
import { generateSignedCsrfToken } from '../utils/csrf';
import { AuthRequest } from '../types';
import { RegisterInput, LoginInput } from '../validators/authValidator';
import {
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
  COOKIE_NAMES,
} from '../config/security';

class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const { user, tokens } = await authService.register(data);

      // Set access token cookie (httpOnly)
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

      // Set refresh token cookie (httpOnly)
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Generate CSRF token for subsequent requests
      const csrfToken = generateSignedCsrfToken();

      // Send user data with CSRF token
      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
          csrfToken,
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const { user, tokens } = await authService.login(data);

      // Set access token cookie (httpOnly)
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

      // Set refresh token cookie (httpOnly)
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Generate CSRF token for subsequent requests
      const csrfToken = generateSignedCsrfToken();

      // Send user data with CSRF token
      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
          csrfToken,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Read refresh token from cookie instead of request body
      const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const tokens = await authService.refreshToken(refreshToken);

      // Set new access token cookie
      res.cookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

      // Set new refresh token cookie
      res.cookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Generate a new CSRF token for the refreshed session
      const csrfToken = generateSignedCsrfToken();

      // Send success response with new CSRF token
      sendSuccess(res, { csrfToken }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not found in request');
      }

      const user = await authService.getUserById(req.user.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate a new CSRF token for the session
      // This ensures CSRF token is available after page refresh
      const csrfToken = generateSignedCsrfToken();

      sendSuccess(
        res,
        {
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
          csrfToken,
        },
        'User retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Logout - Clear authentication cookies
  async logout(_req: Request, res: Response): Promise<void> {
    // Clear access token cookie
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
      ...ACCESS_TOKEN_COOKIE_OPTIONS,
      maxAge: 0,
    });

    // Clear refresh token cookie
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: 0,
    });

    // Optional: Clear CSRF token cookie
    res.clearCookie(COOKIE_NAMES.CSRF_TOKEN);

    // Optional: Clear browser cache and storage (in modern browsers)
    res.setHeader('Clear-Site-Data', '"cache", "cookies", "storage"');

    sendSuccess(res, null, 'Logged out successfully');
  }
}

export default new AuthController();
