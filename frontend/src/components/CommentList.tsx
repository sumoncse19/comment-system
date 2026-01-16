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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Radio, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  const handleSocketCommentCreated = useCallback(
    (payload: CommentCreatedPayload) => {
      if (page === 1 && sort === 'newest') {
        setComments((prev) => [payload.comment, ...prev]);
        setPagination((prev) => (prev ? { ...prev, totalItems: prev.totalItems + 1 } : prev));
      }
    },
    [page, sort]
  );

  const handleSocketReplyCreated = useCallback((payload: ReplyCreatedPayload) => {
    setComments((prev) => {
      // Recursive function to add reply at any nesting level
      const addReplyToComment = (comment: Comment): Comment => {
        if (comment._id === payload.parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), payload.comment],
          };
        }
        // If not the parent, check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(addReplyToComment),
          };
        }
        return comment;
      };

      return prev.map(addReplyToComment);
    });
  }, []);

  const handleSocketCommentUpdated = useCallback((payload: CommentUpdatedPayload) => {
    setComments((prev) => {
      // Recursive function to update comment at any nesting level
      const updateComment = (comment: Comment): Comment => {
        if (comment._id === payload.comment._id) {
          return { ...comment, ...payload.comment };
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(updateComment),
          };
        }
        return comment;
      };

      return prev.map(updateComment);
    });
  }, []);

  const handleSocketCommentDeleted = useCallback((payload: CommentDeletedPayload) => {
    if (payload.parentId) {
      setComments((prev) => {
        // Recursive function to delete comment at any nesting level
        const deleteFromComment = (comment: Comment): Comment => {
          if (comment._id === payload.parentId) {
            return {
              ...comment,
              replies: comment.replies?.filter((reply) => reply._id !== payload.commentId),
            };
          }
          // Check nested replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map(deleteFromComment),
            };
          }
          return comment;
        };

        return prev.map(deleteFromComment);
      });
    } else {
      setComments((prev) => prev.filter((comment) => comment._id !== payload.commentId));
      setPagination((prev) => (prev ? { ...prev, totalItems: Math.max(0, prev.totalItems - 1) } : prev));
    }
  }, []);

  const handleSocketCommentReaction = useCallback((payload: CommentReactionPayload) => {
    setComments((prev) => {
      // Recursive function to update reaction at any nesting level
      const updateReaction = (comment: Comment): Comment => {
        if (comment._id === payload.comment._id) {
          return {
            ...comment,
            likesCount: payload.comment.likesCount,
            dislikesCount: payload.comment.dislikesCount,
          };
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(updateReaction),
          };
        }
        return comment;
      };

      return prev.map(updateReaction);
    });
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
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    await commentApi.createComment({ content, pageId, parentComment: parentId });
  };

  const handleUpdate = async (id: string, content: string) => {
    await commentApi.updateComment(id, { content });
  };

  const handleDelete = async (id: string) => {
    await commentApi.deleteComment(id);
  };

  const handleLike = async (id: string) => {
    // Optimistically update the UI
    setComments((prev) => {
      // Recursive function to update like at any nesting level
      const updateLike = (comment: Comment): Comment => {
        if (comment._id === id) {
          const currentReaction = comment.userReaction;
          const newReaction = currentReaction === 'like' ? null : 'like';
          return {
            ...comment,
            userReaction: newReaction,
            likesCount: newReaction === 'like' ? comment.likesCount + 1 : comment.likesCount - 1,
            dislikesCount: currentReaction === 'dislike' ? comment.dislikesCount - 1 : comment.dislikesCount,
          };
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(updateLike),
          };
        }
        return comment;
      };

      return prev.map(updateLike);
    });

    await commentApi.likeComment(id);
  };

  const handleDislike = async (id: string) => {
    // Optimistically update the UI
    setComments((prev) => {
      // Recursive function to update dislike at any nesting level
      const updateDislike = (comment: Comment): Comment => {
        if (comment._id === id) {
          const currentReaction = comment.userReaction;
          const newReaction = currentReaction === 'dislike' ? null : 'dislike';
          return {
            ...comment,
            userReaction: newReaction,
            dislikesCount: newReaction === 'dislike' ? comment.dislikesCount + 1 : comment.dislikesCount - 1,
            likesCount: currentReaction === 'like' ? comment.likesCount - 1 : comment.likesCount,
          };
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(updateDislike),
          };
        }
        return comment;
      };

      return prev.map(updateDislike);
    });

    await commentApi.dislikeComment(id);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments
              {pagination && (
                <Badge variant="secondary" className="ml-1">
                  {pagination.totalItems}
                </Badge>
              )}
            </CardTitle>
            <Badge variant="success" className="gap-1.5">
              <Radio className="h-3 w-3 animate-pulse" />
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="newest">Newest</option>
              <option value="mostLiked">Most Liked</option>
              <option value="mostDisliked">Most Disliked</option>
            </select>
          </div>
        </div>
        {pagination && (
          <CardDescription>
            Showing {comments.length} of {pagination.totalItems} comments
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isAuthenticated ? (
          <CommentForm
            onSubmit={handleCreateComment}
            placeholder="Share your thoughts..."
            buttonText="Post Comment"
          />
        ) : (
          <Alert>
            <AlertDescription>
              Please{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                login
              </Link>{' '}
              to post a comment.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No comments yet.</p>
            <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onLike={handleLike}
                onDislike={handleDislike}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onReply={handleReply}
                depth={0}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentList;
