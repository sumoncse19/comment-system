import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ApiError } from '../utils/ApiError';
import { IUser, AuthTokens, JwtPayload } from '../types';
import { RegisterInput, LoginInput } from '../validators/authValidator';

class AuthService {
  // Generate access token
  private generateAccessToken(user: IUser): string {
    const payload: JwtPayload = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as jwt.SignOptions);
  }

  // Generate refresh token
  private generateRefreshToken(user: IUser): string {
    const payload = {
      id: user._id.toString(),
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  // Generate both tokens
  private generateTokens(user: IUser): AuthTokens {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  // Register new user
  async register(data: RegisterInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const { username, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw ApiError.conflict('Email already registered');
      }
      throw ApiError.conflict('Username already taken');
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  // Login user
  async login(data: LoginInput): Promise<{ user: IUser; tokens: AuthTokens }> {
    const { email, password } = data;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { id: string };

      // Find user
      const user = await User.findById(decoded.id);

      if (!user) {
        throw ApiError.unauthorized('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Refresh token expired, please login again');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid refresh token');
      }
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  // Verify access token and return payload
  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ApiError.unauthorized('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw ApiError.unauthorized('Invalid access token');
      }
      throw error;
    }
  }
}

export default new AuthService();
