import { z } from 'zod';

// Create comment validation schema
export const createCommentSchema = z.object({
  content: z
    .string({ message: 'Content is required' })
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters')
    .trim(),
  pageId: z
    .string({ message: 'Page ID is required' })
    .min(1, 'Page ID is required')
    .trim(),
  parentComment: z
    .string()
    .optional(),
});

// Update comment validation schema
export const updateCommentSchema = z.object({
  content: z
    .string({ message: 'Content is required' })
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment cannot exceed 5000 characters')
    .trim(),
});

// Query params validation schema
export const commentQuerySchema = z.object({
  pageId: z
    .string({ message: 'Page ID is required' })
    .min(1, 'Page ID is required'),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page must be a positive number'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  sort: z
    .enum(['newest', 'mostLiked', 'mostDisliked'])
    .optional()
    .default('newest'),
});

// Type exports
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQueryInput = z.infer<typeof commentQuerySchema>;
