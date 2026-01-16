import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ==================== User Types ====================
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserPayload {
  id: string;
  username: string;
  email: string;
}

// ==================== Comment Types ====================
export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId | IUser;
  pageId: string;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  likesCount: number;
  dislikesCount: number;
  parentComment?: Types.ObjectId | null;
  replies: Types.ObjectId[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Request Types ====================
export interface AuthRequest extends Request {
  user?: IUserPayload;
}

// ==================== Response Types ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: Record<string, string>;
  };
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ==================== Auth Types ====================
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ==================== Comment Input Types ====================
export interface CreateCommentInput {
  content: string;
  pageId: string;
  parentComment?: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentQueryParams {
  pageId: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'mostLiked' | 'mostDisliked';
}

// ==================== JWT Types ====================
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

// ==================== Socket Types ====================
export interface SocketUser {
  userId: string;
  socketId: string;
  pageId?: string;
}
