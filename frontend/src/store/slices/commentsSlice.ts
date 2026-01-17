import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Comment, CommentQueryParams, PaginationMeta } from '../../types';
import { commentApi } from '../../api/commentApi';
import { toast } from 'sonner';

/**
 * Comments State Interface
 */
interface CommentsState {
  comments: Comment[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  sort: 'newest' | 'mostLiked' | 'mostDisliked';
  pageId: string;
}

/**
 * Initial State
 */
const initialState: CommentsState = {
  comments: [],
  pagination: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  sort: 'newest',
  pageId: 'home-page',
};

/**
 * Async Thunks for Comment Actions
 */

// Fetch comments
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (params: CommentQueryParams, { rejectWithValue }) => {
    try {
      const response = await commentApi.getComments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to load comments');
    }
  }
);

// Create comment
export const createComment = createAsyncThunk(
  'comments/createComment',
  async (data: { content: string; pageId: string; parentComment?: string }, { rejectWithValue }) => {
    try {
      await commentApi.createComment(data);
      toast.success('Comment posted successfully!');
      return data.pageId;
    } catch (error) {
      toast.error('Failed to post comment. Please try again.');
      return rejectWithValue('Failed to create comment');
    }
  }
);

// Update comment
export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ id, data }: { id: string; data: { content: string } }, { rejectWithValue }) => {
    try {
      await commentApi.updateComment(id, data);
      toast.success('Comment updated successfully!');
      return { id, content: data.content };
    } catch (error) {
      toast.error('Failed to update comment. Please try again.');
      return rejectWithValue('Failed to update comment');
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (id: string, { rejectWithValue }) => {
    try {
      await commentApi.deleteComment(id);
      toast.success('Comment deleted successfully!');
      return id;
    } catch (error) {
      toast.error('Failed to delete comment. Please try again.');
      return rejectWithValue('Failed to delete comment');
    }
  }
);

// Like comment
export const likeComment = createAsyncThunk(
  'comments/likeComment',
  async (id: string, { rejectWithValue }) => {
    try {
      await commentApi.likeComment(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to like comment');
    }
  }
);

// Dislike comment
export const dislikeComment = createAsyncThunk(
  'comments/dislikeComment',
  async (id: string, { rejectWithValue }) => {
    try {
      await commentApi.dislikeComment(id);
      return id;
    } catch (error) {
      return rejectWithValue('Failed to dislike comment');
    }
  }
);

/**
 * Helper function to recursively update comment in nested structure
 */
const updateCommentRecursively = (
  comments: Comment[],
  commentId: string,
  updater: (comment: Comment) => Comment
): Comment[] => {
  return comments.map((comment) => {
    if (comment._id === commentId) {
      return updater(comment);
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentRecursively(comment.replies, commentId, updater),
      };
    }
    return comment;
  });
};

/**
 * Helper function to recursively add reply to comment
 */
const addReplyToComment = (comments: Comment[], parentId: string, reply: Comment): Comment[] => {
  return comments.map((comment) => {
    if (comment._id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), reply],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentId, reply),
      };
    }
    return comment;
  });
};

/**
 * Helper function to recursively delete comment
 */
const deleteCommentRecursively = (comments: Comment[], commentId: string, parentId?: string): Comment[] => {
  if (parentId) {
    // It's a reply - remove from nested replies
    return comments.map((comment) => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: comment.replies?.filter((reply) => reply._id !== commentId),
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: deleteCommentRecursively(comment.replies, commentId, parentId),
        };
      }
      return comment;
    });
  }
  // It's a parent comment - remove from top level
  return comments.filter((comment) => comment._id !== commentId);
};

/**
 * Comments Slice
 */
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // Set page
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    // Set sort
    setSort: (state, action: PayloadAction<'newest' | 'mostLiked' | 'mostDisliked'>) => {
      state.sort = action.payload;
      state.currentPage = 1; // Reset to page 1 when sorting changes
    },
    // Set page ID
    setPageId: (state, action: PayloadAction<string>) => {
      state.pageId = action.payload;
    },
    // Add comment from socket (real-time)
    addCommentFromSocket: (state, action: PayloadAction<Comment>) => {
      const newComment = action.payload;

      // Check if comment already exists (prevent duplicates)
      const exists = state.comments.some((c) => c._id === newComment._id);
      if (exists) return;

      // Add to visible list if on page 1 and sorting by newest
      if (state.currentPage === 1 && state.sort === 'newest') {
        state.comments = [newComment, ...state.comments].slice(0, 10);
      }

      // Always update pagination count
      if (state.pagination) {
        state.pagination.totalItems += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
        state.pagination.hasNextPage = state.currentPage < state.pagination.totalPages;
      }
    },
    // Add reply from socket (real-time)
    addReplyFromSocket: (state, action: PayloadAction<{ parentId: string; comment: Comment }>) => {
      state.comments = addReplyToComment(state.comments, action.payload.parentId, action.payload.comment);
    },
    // Update comment from socket (real-time)
    updateCommentFromSocket: (state, action: PayloadAction<Comment>) => {
      state.comments = updateCommentRecursively(state.comments, action.payload._id, () => action.payload);
    },
    // Delete comment from socket (real-time)
    deleteCommentFromSocket: (state, action: PayloadAction<{ commentId: string; parentId?: string }>) => {
      state.comments = deleteCommentRecursively(
        state.comments,
        action.payload.commentId,
        action.payload.parentId
      );
      if (!action.payload.parentId && state.pagination) {
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage) || 1;
      }
    },
    // Update reaction from socket (real-time)
    updateReactionFromSocket: (
      state,
      action: PayloadAction<{ commentId: string; likesCount: number; dislikesCount: number }>
    ) => {
      state.comments = updateCommentRecursively(state.comments, action.payload.commentId, (comment) => ({
        ...comment,
        likesCount: action.payload.likesCount,
        dislikesCount: action.payload.dislikesCount,
      }));
    },
    // Optimistic like update
    optimisticLike: (state, action: PayloadAction<string>) => {
      state.comments = updateCommentRecursively(state.comments, action.payload, (comment) => {
        const currentReaction = comment.userReaction;
        const newReaction = currentReaction === 'like' ? null : 'like';
        return {
          ...comment,
          userReaction: newReaction,
          likesCount: newReaction === 'like' ? comment.likesCount + 1 : comment.likesCount - 1,
          dislikesCount: currentReaction === 'dislike' ? comment.dislikesCount - 1 : comment.dislikesCount,
        };
      });
    },
    // Optimistic dislike update
    optimisticDislike: (state, action: PayloadAction<string>) => {
      state.comments = updateCommentRecursively(state.comments, action.payload, (comment) => {
        const currentReaction = comment.userReaction;
        const newReaction = currentReaction === 'dislike' ? null : 'dislike';
        return {
          ...comment,
          userReaction: newReaction,
          dislikesCount: newReaction === 'dislike' ? comment.dislikesCount + 1 : comment.dislikesCount - 1,
          likesCount: currentReaction === 'like' ? comment.likesCount - 1 : comment.likesCount,
        };
      });
    },
  },
  extraReducers: (builder) => {
    // Fetch Comments
    builder
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Comment - refetch after creation
    builder.addCase(createComment.fulfilled, (state) => {
      // Comments will be refetched or updated via socket
      state.error = null;
    });

    // Update Comment - refetch after update
    builder.addCase(updateComment.fulfilled, (state) => {
      // Comments will be refetched or updated via socket
      state.error = null;
    });

    // Delete Comment - refetch after deletion
    builder.addCase(deleteComment.fulfilled, (state) => {
      // Comments will be refetched or updated via socket
      state.error = null;
    });
  },
});

// Export actions
export const {
  setPage,
  setSort,
  setPageId,
  addCommentFromSocket,
  addReplyFromSocket,
  updateCommentFromSocket,
  deleteCommentFromSocket,
  updateReactionFromSocket,
  optimisticLike,
  optimisticDislike,
} = commentsSlice.actions;

// Export reducer
export default commentsSlice.reducer;

// Selectors
export const selectComments = (state: { comments: CommentsState }) => state.comments.comments;
export const selectPagination = (state: { comments: CommentsState }) => state.comments.pagination;
export const selectCommentsLoading = (state: { comments: CommentsState }) => state.comments.isLoading;
export const selectCommentsError = (state: { comments: CommentsState }) => state.comments.error;
export const selectCurrentPage = (state: { comments: CommentsState }) => state.comments.currentPage;
export const selectSort = (state: { comments: CommentsState }) => state.comments.sort;
export const selectPageId = (state: { comments: CommentsState }) => state.comments.pageId;
