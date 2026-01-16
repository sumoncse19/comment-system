import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationMeta } from '../types';

// Send success response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

// Send paginated response
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message: string = 'Success'
): Response => {
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    message,
    data: {
      data,
      pagination,
    },
  };
  return res.status(200).json(response);
};

// Send error response
export const sendError = (
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode: number = 500,
  details: Record<string, string> | null = null
): Response => {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};

// Calculate pagination metadata
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Generate a random string (for tokens, etc.)
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
