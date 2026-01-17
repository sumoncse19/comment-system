import { useState, memo } from 'react';
import type { Comment } from '../types';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import CommentForm from './CommentForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ThumbsUp, ThumbsDown, Reply, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * Format date relative to now (moved outside component to avoid recreation on each render)
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => Promise<void>;
  onDislike: (id: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
  depth?: number;
}

const CommentItem = ({
  comment,
  onLike,
  onDislike,
  onUpdate,
  onDelete,
  onReply,
  depth = 0,
}: CommentItemProps) => {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isOwner = user?._id === comment.author._id;
  const canReply = depth < 2;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Close reply form when collapsing
    if (!isCollapsed && isReplying) {
      setIsReplying(false);
    }
  };

  const handleUpdate = async (content: string) => {
    await onUpdate(comment._id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setIsReplying(false);
  };

  return (
    <Card className={`comment ${depth > 0 ? 'comment--reply' : ''} transition`}>
      <div className="p-4">
        <div className="comment__header">
          <div className="comment__author">
            <div className="avatar avatar--md">
              {comment.author.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="avatar__image"
                />
              ) : (
                <div className="avatar__fallback">
                  {comment.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="comment__author-info">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="comment__author-name">{comment.author.username}</span>
                <span className="comment__meta">
                  <span className="comment__time">{formatDate(comment.createdAt)}</span>
                </span>
                {comment.isEdited && (
                  <Badge variant="secondary" size="sm">
                    edited
                  </Badge>
                )}
                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleCollapse}
                    className="comment__replies-toggle"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
                        {comment.replies?.length ?? 0} {(comment.replies?.length ?? 0) === 1 ? 'reply' : 'replies'}
                      </>
                    ) : (
                      <>
                        <ChevronDown style={{ width: '0.75rem', height: '0.75rem' }} />
                        {comment.replies?.length ?? 0} {(comment.replies?.length ?? 0) === 1 ? 'reply' : 'replies'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isOwner && !isEditing && (
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="icon"
                title="Edit"
              >
                <Edit2 style={{ width: '1rem', height: '1rem' }} />
              </Button>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    title="Delete"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="spinner spinner--sm" />
                    ) : (
                      <Trash2 style={{ width: '1rem', height: '1rem' }} />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action cannot be undone.
                      {comment.replies && comment.replies.length > 0 && (
                        <span className="block mt-2 font-medium text-destructive">
                          This will also delete all {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="btn--destructive"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentForm
            onSubmit={handleUpdate}
            initialValue={comment.content}
            buttonText="Update"
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <div className="comment__content">
              <p>{comment.content}</p>
            </div>

            <div className="comment__footer">
              <div className="comment__reactions">
                <button
                  onClick={() => onLike(comment._id)}
                  className={`comment__reaction-btn comment__reaction-btn--like ${comment.userReaction === 'like' ? 'comment__reaction-btn--active' : ''}`}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Like' : 'Login to like'}
                >
                  <ThumbsUp style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>{comment.likesCount}</span>
                </button>
                <button
                  onClick={() => onDislike(comment._id)}
                  className={`comment__reaction-btn comment__reaction-btn--dislike ${comment.userReaction === 'dislike' ? 'comment__reaction-btn--active' : ''}`}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Dislike' : 'Login to dislike'}
                >
                  <ThumbsDown style={{ width: '0.875rem', height: '0.875rem' }} />
                  <span>{comment.dislikesCount}</span>
                </button>
              </div>

              {canReply && isAuthenticated && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="comment__reply-btn"
                >
                  <Reply style={{ width: '0.875rem', height: '0.875rem' }} />
                  {isReplying ? 'Cancel' : 'Reply'}
                </button>
              )}
            </div>
          </>
        )}

        {isReplying && !isCollapsed && (
          <div className="comment__reply-form">
            <CommentForm
              onSubmit={handleReply}
              placeholder="Write a reply..."
              buttonText="Reply"
              onCancel={() => setIsReplying(false)}
              isReply
            />
          </div>
        )}
      </div>

      {/* Render replies */}
      {!isCollapsed && comment.replies && comment.replies.length > 0 && (
        <div className="comment__replies-list p-4 pt-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onDislike={onDislike}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * Memoized CommentItem component to prevent unnecessary re-renders
 * Only re-renders when comment data changes (not when parent re-renders)
 */
export default memo(CommentItem, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (re-render needed)

  const commentEqual =
    prevProps.comment._id === nextProps.comment._id &&
    prevProps.comment.content === nextProps.comment.content &&
    prevProps.comment.likesCount === nextProps.comment.likesCount &&
    prevProps.comment.dislikesCount === nextProps.comment.dislikesCount &&
    prevProps.comment.userReaction === nextProps.comment.userReaction &&
    prevProps.comment.isEdited === nextProps.comment.isEdited &&
    prevProps.comment.updatedAt === nextProps.comment.updatedAt &&
    // Compare replies by reference, not just length
    // This ensures re-render when nested replies change
    prevProps.comment.replies === nextProps.comment.replies;

  const depthEqual = prevProps.depth === nextProps.depth;

  // Functions are stable (from parent), so we don't need to compare them
  return commentEqual && depthEqual;
});
