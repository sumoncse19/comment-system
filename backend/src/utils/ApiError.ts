export class ApiError extends Error {
  statusCode: number;
  code: string;
  details: Record<string, string> | null;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    details: Record<string, string> | null = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // 400 Bad Request
  static badRequest(
    message: string = 'Bad request',
    details: Record<string, string> | null = null
  ): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  // 401 Unauthorized
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  // 403 Forbidden
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  // 404 Not Found
  static notFound(resource: string = 'Resource'): ApiError {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  // 409 Conflict
  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }

  // 422 Validation Error
  static validationError(
    message: string = 'Validation failed',
    details: Record<string, string> | null = null
  ): ApiError {
    return new ApiError(422, message, 'VALIDATION_ERROR', details);
  }

  // 429 Too Many Requests
  static tooManyRequests(message: string = 'Too many requests'): ApiError {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  // 500 Internal Server Error
  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}

export default ApiError;
