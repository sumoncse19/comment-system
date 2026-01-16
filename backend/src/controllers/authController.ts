import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { sendSuccess } from '../utils/helpers';
import { AuthRequest } from '../types';
import { RegisterInput, LoginInput } from '../validators/authValidator';

class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const { user, tokens } = await authService.register(data);

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
          ...tokens,
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
          ...tokens,
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
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      sendSuccess(res, tokens, 'Token refreshed successfully');
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
        },
        'User retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side will handle token removal)
  async logout(_req: Request, res: Response): Promise<void> {
    // In a more complex setup, you might want to:
    // - Blacklist the refresh token
    // - Clear any server-side sessions
    // For now, we just send a success response
    sendSuccess(res, null, 'Logged out successfully');
  }
}

export default new AuthController();
