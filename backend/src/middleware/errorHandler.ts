import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../types';

interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { path: string; message: string }>;
}

export const errorHandler = (
  err: Error | ApiError | MongooseError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let error: ApiError;

  // If it's already an ApiError, use it directly
  if (err instanceof ApiError) {
    error = err;
  }
  // Mongoose CastError (invalid ObjectId)
  else if (err.name === 'CastError') {
    error = ApiError.badRequest('Invalid ID format');
  }
  // Mongoose duplicate key error
  else if ((err as MongooseError).code === 11000) {
    const field = Object.keys((err as MongooseError).keyValue || {})[0];
    error = ApiError.conflict(`${field} already exists`);
  }
  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const mongooseErr = err as MongooseError;
    const details: Record<string, string> = {};
    if (mongooseErr.errors) {
      Object.values(mongooseErr.errors).forEach((e) => {
        details[e.path] = e.message;
      });
    }
    error = ApiError.validationError('Validation failed', details);
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }
  else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }
  // Default to internal server error
  else {
    error = ApiError.internal(
      process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    );
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  const response: ApiResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  return res.status(error.statusCode).json(response);
};

// Async handler wrapper to avoid try-catch in every controller
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
