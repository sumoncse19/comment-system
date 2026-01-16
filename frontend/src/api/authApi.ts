import api from './axios';
import type {
  LoginCredentials,
  RegisterCredentials,
  ApiResponse,
  AuthResponse,
  TokenResponse,
  UserResponse,
} from '../types';

export const authApi = {
  // Register new user
  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      credentials
    );
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<TokenResponse>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get<ApiResponse<UserResponse>>('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },
};
