import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'query' | 'params';

// Extend Request to include validatedQuery
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export const validate = (
  schema: z.ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate) as Record<string, unknown>;

      // For query params in Express 5, store in a custom property
      // because req.query is read-only
      if (target === 'query') {
        req.validatedQuery = validatedData;
      } else {
        // For body, direct assignment works
        req.body = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details: Record<string, string> = {};
        error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path.join('.');
          details[path || 'value'] = issue.message;
        });
        next(ApiError.validationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};

// Shorthand for query validation
export const validateQuery = (schema: z.ZodSchema) => validate(schema, 'query');

// Shorthand for params validation
export const validateParams = (schema: z.ZodSchema) => validate(schema, 'params');

export default validate;
