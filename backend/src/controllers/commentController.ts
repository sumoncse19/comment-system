import { Response } from 'express';
import { AuthRequest } from '../types';
import commentService from '../services/commentService';
import { sendSuccess, sendPaginated } from '../utils/helpers';
import { asyncHandler } from '../middleware/errorHandler';
import { CreateCommentInput, UpdateCommentInput, CommentQueryInput } from '../validators/commentValidator';

class CommentController {
  // Create a new comment
  createComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = req.body as CreateCommentInput;
    const userId = req.user!.id;

    const comment = await commentService.createComment(data, userId);

    sendSuccess(res, { comment }, 'Comment created successfully', 201);
  });

  // Get comments with pagination
  getComments = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Use validatedQuery from middleware (Express 5 has read-only req.query)
    const query = (req.validatedQuery || req.query) as unknown as CommentQueryInput;
    const userId = req.user?.id;

    const result = await commentService.getComments(query, userId);

    sendPaginated(res, result.data, result.pagination, 'Comments retrieved successfully');
  });

  // Get a single comment
  getComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const comment = await commentService.getCommentById(id, userId);

    sendSuccess(res, { comment }, 'Comment retrieved successfully');
  });

  // Update a comment
  updateComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const data = req.body as UpdateCommentInput;
    const userId = req.user!.id;

    const comment = await commentService.updateComment(id, data, userId);

    sendSuccess(res, { comment }, 'Comment updated successfully');
  });

  // Delete a comment
  deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    await commentService.deleteComment(id, userId);

    sendSuccess(res, null, 'Comment deleted successfully');
  });

  // Like a comment
  likeComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const comment = await commentService.likeComment(id, userId);

    sendSuccess(res, { comment }, 'Comment liked successfully');
  });

  // Dislike a comment
  dislikeComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const comment = await commentService.dislikeComment(id, userId);

    sendSuccess(res, { comment }, 'Comment disliked successfully');
  });
}

export default new CommentController();
