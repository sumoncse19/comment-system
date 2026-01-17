// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, string>;
  };
}

// Auth response types
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  user: User;
}

// Comment types
export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    avatar: string | null;
  };
  pageId: string;
  likesCount: number;
  dislikesCount: number;
  isEdited: boolean;
  userReaction: 'like' | 'dislike' | null;
  replies?: Comment[];
  parentComment?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface CommentResponse {
  comment: Comment;
}

export interface CommentsResponse {
  data: Comment[];
  pagination: PaginationMeta;
}
