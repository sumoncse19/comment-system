import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/authApi';
import type { AxiosError } from 'axios';
import { STORAGE_KEYS, clearAuthData } from '../config/security';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      // If we have stored user data, verify the session is still valid
      // Access token is in httpOnly cookie, so backend will validate it
      if (storedUser) {
        try {
          // Verify token is still valid (cookie sent automatically)
          const response = await authApi.getMe();
          setUser(response.data.user);
        } catch {
          // Token invalid or expired - clear user data
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(credentials);
      const { user } = response.data;

      // Store user data only (tokens are in httpOnly cookies)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setUser(user);
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      const message = error.response?.data?.error?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.register(credentials);
      const { user } = response.data;

      // Store user data only (tokens are in httpOnly cookies)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setUser(user);
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string; details?: Record<string, string> } }>;
      const message = error.response?.data?.error?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Log logout errors for debugging but don't block logout
      console.error('Logout API call failed:', error);
    } finally {
      // Clear storage and state
      clearAuthData();
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
