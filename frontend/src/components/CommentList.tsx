import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment,
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
  selectComments,
  selectPagination,
  selectCommentsLoading,
  selectCommentsError,
  selectCurrentPage,
  selectSort,
} from '../store/slices/commentsSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
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
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const comments = useAppSelector(selectComments);
  const pagination = useAppSelector(selectPagination);
  const sort = useAppSelector(selectSort);
  const page = useAppSelector(selectCurrentPage);
  const isLoading = useAppSelector(selectCommentsLoading);
  const error = useAppSelector(selectCommentsError);

  // Track if we're currently creating a comment (to handle socket events correctly)
  const isCreatingCommentRef = useRef(false);

  // Set pageId when component mounts
  useEffect(() => {
    dispatch(setPageId(pageId));
  }, [dispatch, pageId]);

  // Socket event handlers - dispatch Redux actions
  const handleSocketCommentCreated = useCallback(
    (payload: CommentCreatedPayload) => {
      // If we're the one creating the comment, just add it directly
      // (we've already navigated to page 1)
      if (isCreatingCommentRef.current) {
        dispatch(addCommentFromSocket(payload.comment));
        return;
      }

      // For other users: if on page 1 with newest sort, add comment directly
      if (page === 1 && sort === 'newest') {
        dispatch(addCommentFromSocket(payload.comment));
      } else {
        // For other pages/sorts, refetch to get correct data
        // (new comment shifts pagination)
        dispatch(
          fetchComments({
            pageId,
            page,
            limit: 10,
            sort,
          })
        );
      }
    },
    [dispatch, page, sort, pageId]
  );

  const handleSocketReplyCreated = useCallback(
    (payload: ReplyCreatedPayload) => {
      dispatch(addReplyFromSocket({ parentId: payload.parentId, comment: payload.comment }));
    },
    [dispatch]
  );

  const handleSocketCommentUpdated = useCallback(
    (payload: CommentUpdatedPayload) => {
      dispatch(updateCommentFromSocket(payload.comment));
    },
    [dispatch]
  );

  const handleSocketCommentDeleted = useCallback(
    (payload: CommentDeletedPayload) => {
      // For replies, just update the local state
      if (payload.parentId) {
        dispatch(deleteCommentFromSocket({
          commentId: payload.commentId,
          parentId: payload.parentId ?? undefined
        }));
        return;
      }

      // For parent comments, check if we need to refetch
      if (page === 1) {
        // On page 1, just remove locally and update pagination
        dispatch(deleteCommentFromSocket({
          commentId: payload.commentId,
          parentId: undefined
        }));
      } else {
        // On other pages, refetch to get correct shifted data
        dispatch(
          fetchComments({
            pageId,
            page,
            limit: 10,
            sort,
          })
        );
      }
    },
    [dispatch, page, pageId, sort]
  );

  const handleSocketCommentReaction = useCallback(
    (payload: CommentReactionPayload) => {
      dispatch(
        updateReactionFromSocket({
          commentId: payload.comment._id,
          likesCount: payload.comment.likesCount,
          dislikesCount: payload.comment.dislikesCount,
        })
      );
    },
    [dispatch]
  );

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

  // Fetch comments when page, sort, or pageId changes
  useEffect(() => {
    dispatch(
      fetchComments({
        pageId,
        page,
        limit: 10,
        sort,
      })
    );
  }, [dispatch, pageId, page, sort]);

  const handleCreateComment = useCallback(async (content: string) => {
    // Mark that we're creating a comment (prevents socket handler from interfering)
    isCreatingCommentRef.current = true;

    try {
      await dispatch(createComment({ content, pageId })).unwrap();

      // After creating, ensure we're on page 1 with newest sort and fetch fresh data
      if (sort !== 'newest') {
        dispatch(setSort('newest'));
      }
      dispatch(setPage(1));

      // Fetch page 1 to show the new comment
      await dispatch(
        fetchComments({
          pageId,
          page: 1,
          limit: 10,
          sort: 'newest',
        })
      );
    } catch {
      // Error handled by Redux
    } finally {
      isCreatingCommentRef.current = false;
    }
  }, [dispatch, pageId, sort]);

  const handleReply = async (parentId: string, content: string) => {
    try {
      await dispatch(createComment({ content, pageId, parentComment: parentId })).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = async (id: string, content: string) => {
    try {
      await dispatch(updateComment({ id, data: { content } })).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteComment(id)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const handleLike = async (id: string) => {
    // Optimistically update the UI
    dispatch(optimisticLike(id));
    await dispatch(likeComment(id));
  };

  const handleDislike = async (id: string) => {
    // Optimistically update the UI
    dispatch(optimisticDislike(id));
    await dispatch(dislikeComment(id));
  };

  const handleSortChange = (newSort: SortOption) => {
    dispatch(setSort(newSort));
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
              onClick={() => dispatch(setPage(page - 1))}
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
              onClick={() => dispatch(setPage(page + 1))}
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
