import mongoose from 'mongoose';
import Comment from '../models/Comment';
import { ApiError } from '../utils/ApiError';
import { IComment, PaginatedResponse, PaginationMeta } from '../types';
import { CreateCommentInput, UpdateCommentInput, CommentQueryInput } from '../validators/commentValidator';
import { emitToPage, SOCKET_EVENTS } from '../config/socket';

// Plain object type for lean() results
interface CommentLean {
  _id: mongoose.Types.ObjectId;
  content: string;
  author: { _id: mongoose.Types.ObjectId; username: string; avatar?: string };
  pageId: string;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  likesCount: number;
  dislikesCount: number;
  parentComment?: mongoose.Types.ObjectId | null;
  replies?: CommentLean[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Reply with reaction (no nested replies)
interface ReplyWithReaction extends Omit<CommentLean, 'replies'> {
  userReaction: 'like' | 'dislike' | null;
}

// Top-level comment with reaction
interface CommentWithReaction extends Omit<CommentLean, 'replies'> {
  userReaction: 'like' | 'dislike' | null;
  replies?: ReplyWithReaction[];
}

class CommentService {
  // Create a new comment
  async createComment(
    data: CreateCommentInput,
    authorId: string
  ): Promise<IComment> {
    const { content, pageId, parentComment } = data;

    // If it's a reply, verify parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        throw ApiError.notFound('Parent comment not found');
      }
      // Don't allow nested replies (only 1 level deep)
      if (parent.parentComment) {
        throw ApiError.badRequest('Cannot reply to a reply');
      }
    }

    const comment = await Comment.create({
      content,
      pageId,
      author: authorId,
      parentComment: parentComment || null,
    });

    // If it's a reply, add to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id },
      });
    }

    // Populate author before returning
    await comment.populate('author', 'username avatar');

    // Emit socket event
    if (parentComment) {
      emitToPage(pageId, SOCKET_EVENTS.REPLY_CREATED, {
        comment: comment.toObject(),
        parentId: parentComment,
      });
    } else {
      emitToPage(pageId, SOCKET_EVENTS.COMMENT_CREATED, {
        comment: comment.toObject(),
      });
    }

    return comment;
  }

  // Get comments with pagination and sorting
  async getComments(
    query: CommentQueryInput,
    userId?: string
  ): Promise<PaginatedResponse<CommentWithReaction>> {
    const { pageId, page = 1, limit = 10, sort = 'newest' } = query;

    // Build sort options
    let sortOption: Record<string, 1 | -1> = {};
    switch (sort) {
      case 'mostLiked':
        sortOption = { likesCount: -1, createdAt: -1 };
        break;
      case 'mostDisliked':
        sortOption = { dislikesCount: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    // Only get top-level comments (not replies)
    const filter = { pageId, parentComment: null };

    // Get total count
    const totalItems = await Comment.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // Get comments
    const comments = await Comment.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar' },
        options: { sort: { createdAt: 1 } },
      })
      .lean<CommentLean[]>();

    // Add user reaction to each comment
    const commentsWithReaction: CommentWithReaction[] = comments.map((comment) => ({
      ...comment,
      userReaction: userId ? this.getUserReaction(comment, userId) : null,
      replies: comment.replies?.map((reply) => ({
        ...reply,
        userReaction: userId ? this.getUserReaction(reply, userId) : null,
      })),
    }));

    const pagination: PaginationMeta = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return { data: commentsWithReaction, pagination };
  }

  // Get a single comment by ID
  async getCommentById(commentId: string, userId?: string): Promise<CommentWithReaction> {
    const comment = await Comment.findById(commentId)
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'username avatar' },
        options: { sort: { createdAt: 1 } },
      })
      .lean<CommentLean>();

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    return {
      ...comment,
      userReaction: userId ? this.getUserReaction(comment, userId) : null,
      replies: comment.replies?.map((reply) => ({
        ...reply,
        userReaction: userId ? this.getUserReaction(reply, userId) : null,
      })),
    };
  }

  // Update a comment
  async updateComment(
    commentId: string,
    data: UpdateCommentInput,
    userId: string
  ): Promise<IComment> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      throw ApiError.forbidden('You can only edit your own comments');
    }

    comment.content = data.content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username avatar');

    // Emit socket event
    emitToPage(comment.pageId, SOCKET_EVENTS.COMMENT_UPDATED, {
      comment: comment.toObject(),
    });

    return comment;
  }

  // Delete a comment
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    // Check ownership
    if (comment.author.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    // If it's a parent comment, delete all replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: commentId });
    } else {
      // If it's a reply, remove from parent's replies array
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    }

    const pageId = comment.pageId;
    const parentId = comment.parentComment?.toString() || null;

    await Comment.findByIdAndDelete(commentId);

    // Emit socket event
    emitToPage(pageId, SOCKET_EVENTS.COMMENT_DELETED, {
      commentId,
      parentId,
    });
  }

  // Like a comment
  async likeComment(commentId: string, userId: string): Promise<IComment> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasLiked = comment.likes.some((id) => id.toString() === userId);
    const hasDisliked = comment.dislikes.some((id) => id.toString() === userId);

    if (hasLiked) {
      // Remove like (toggle off)
      comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
    } else {
      // Add like
      comment.likes.push(userObjectId);
      comment.likesCount += 1;

      // Remove dislike if exists
      if (hasDisliked) {
        comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
        comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
      }
    }

    await comment.save();
    await comment.populate('author', 'username avatar');

    // Emit socket event
    emitToPage(comment.pageId, SOCKET_EVENTS.COMMENT_LIKED, {
      comment: comment.toObject(),
    });

    return comment;
  }

  // Dislike a comment
  async dislikeComment(commentId: string, userId: string): Promise<IComment> {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const hasLiked = comment.likes.some((id) => id.toString() === userId);
    const hasDisliked = comment.dislikes.some((id) => id.toString() === userId);

    if (hasDisliked) {
      // Remove dislike (toggle off)
      comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
      comment.dislikesCount = Math.max(0, comment.dislikesCount - 1);
    } else {
      // Add dislike
      comment.dislikes.push(userObjectId);
      comment.dislikesCount += 1;

      // Remove like if exists
      if (hasLiked) {
        comment.likes = comment.likes.filter((id) => id.toString() !== userId);
        comment.likesCount = Math.max(0, comment.likesCount - 1);
      }
    }

    await comment.save();
    await comment.populate('author', 'username avatar');

    // Emit socket event
    emitToPage(comment.pageId, SOCKET_EVENTS.COMMENT_DISLIKED, {
      comment: comment.toObject(),
    });

    return comment;
  }

  // Helper to get user's reaction
  private getUserReaction(comment: Partial<CommentLean>, userId: string): 'like' | 'dislike' | null {
    if (comment.likes?.some((id) => id.toString() === userId)) {
      return 'like';
    }
    if (comment.dislikes?.some((id) => id.toString() === userId)) {
      return 'dislike';
    }
    return null;
  }
}

export default new CommentService();
