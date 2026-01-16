import { useState, useEffect, useCallback } from 'react';
import type { Comment, PaginationMeta } from '../types';
import { commentApi } from '../api/commentApi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import type {
  CommentCreatedPayload,
  ReplyCreatedPayload,
  CommentUpdatedPayload,
  CommentDeletedPayload,
  CommentReactionPayload,
} from '../hooks/useSocket';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

interface CommentListProps {
  pageId: string;
}

type SortOption = 'newest' | 'mostLiked' | 'mostDisliked';

const CommentList = ({ pageId }: CommentListProps) => {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket event handlers
  const handleSocketCommentCreated = useCallback((payload: CommentCreatedPayload) => {
    // Add new comment to the beginning if on first page and sorting by newest
    if (page === 1 && sort === 'newest') {
      setComments((prev) => [payload.comment, ...prev]);
      setPagination((prev) => prev ? { ...prev, totalItems: prev.totalItems + 1 } : prev);
    }
  }, [page, sort]);

  const handleSocketReplyCreated = useCallback((payload: ReplyCreatedPayload) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === payload.parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), payload.comment],
          };
        }
        return comment;
      })
    );
  }, []);

  const handleSocketCommentUpdated = useCallback((payload: CommentUpdatedPayload) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === payload.comment._id) {
          return { ...comment, ...payload.comment };
        }
        // Check if it's a reply
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === payload.comment._id ? { ...reply, ...payload.comment } : reply
            ),
          };
        }
        return comment;
      })
    );
  }, []);

  const handleSocketCommentDeleted = useCallback((payload: CommentDeletedPayload) => {
    if (payload.parentId) {
      // It's a reply - remove from parent's replies
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === payload.parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter((reply) => reply._id !== payload.commentId),
            };
          }
          return comment;
        })
      );
    } else {
      // It's a top-level comment - remove from list
      setComments((prev) => prev.filter((comment) => comment._id !== payload.commentId));
      setPagination((prev) => prev ? { ...prev, totalItems: Math.max(0, prev.totalItems - 1) } : prev);
    }
  }, []);

  const handleSocketCommentReaction = useCallback((payload: CommentReactionPayload) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === payload.comment._id) {
          return {
            ...comment,
            likesCount: payload.comment.likesCount,
            dislikesCount: payload.comment.dislikesCount,
          };
        }
        // Check if it's a reply
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === payload.comment._id
                ? { ...reply, likesCount: payload.comment.likesCount, dislikesCount: payload.comment.dislikesCount }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  }, []);

  // Initialize socket connection
  useSocket({
    pageId,
    onCommentCreated: handleSocketCommentCreated,
    onReplyCreated: handleSocketReplyCreated,
    onCommentUpdated: handleSocketCommentUpdated,
    onCommentDeleted: handleSocketCommentDeleted,
    onCommentLiked: handleSocketCommentReaction,
    onCommentDisliked: handleSocketCommentReaction,
  });

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await commentApi.getComments({
        pageId,
        page,
        limit: 10,
        sort,
      });
      setComments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pageId, page, sort]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (content: string) => {
    await commentApi.createComment({ content, pageId });
    // Socket will handle the UI update, but reset to first page if not there
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    await commentApi.createComment({ content, pageId, parentComment: parentId });
    // Socket will handle the UI update
  };

  const handleUpdate = async (id: string, content: string) => {
    await commentApi.updateComment(id, { content });
    // Socket will handle the UI update
  };

  const handleDelete = async (id: string) => {
    await commentApi.deleteComment(id);
    // Socket will handle the UI update
  };

  const handleLike = async (id: string) => {
    await commentApi.likeComment(id);
    // Socket will handle the UI update
  };

  const handleDislike = async (id: string) => {
    await commentApi.dislikeComment(id);
    // Socket will handle the UI update
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h2>
          Comments {pagination && `(${pagination.totalItems})`}
          <span className="realtime-indicator" title="Real-time updates enabled"> Live</span>
        </h2>
        <div className="comment-sort">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostDisliked">Most Disliked</option>
          </select>
        </div>
      </div>

      {isAuthenticated ? (
        <CommentForm
          onSubmit={handleCreateComment}
          placeholder="Share your thoughts..."
          buttonText="Post Comment"
        />
      ) : (
        <div className="comment-login-prompt">
          <p>Please <a href="/login">login</a> to post a comment.</p>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="comment-empty">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrevPage}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNextPage}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
