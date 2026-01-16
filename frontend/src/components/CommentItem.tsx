import { useState } from 'react';
import type { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from './CommentForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, Reply, Edit2, Trash2 } from 'lucide-react';

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
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?._id === comment.author._id;
  const canReply = depth < 2;

  const formatDate = (dateString: string) => {
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

  const handleUpdate = async (content: string) => {
    await onUpdate(comment._id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(comment._id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = async (content: string) => {
    await onReply(comment._id, content);
    setIsReplying(false);
  };

  return (
    <Card className={`${depth > 0 ? 'ml-8 border-l-2 border-l-primary bg-secondary/20' : ''} transition-all`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
              {comment.author.avatar ? (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                comment.author.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{comment.author.username}</span>
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                {comment.isEdited && (
                  <Badge variant="secondary" className="text-xs py-0">
                    edited
                  </Badge>
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
                className="h-8 w-8"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Delete"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
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
            <div className="mb-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onLike(comment._id)}
                  variant={comment.userReaction === 'like' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Like' : 'Login to like'}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{comment.likesCount}</span>
                </Button>
                <Button
                  onClick={() => onDislike(comment._id)}
                  variant={comment.userReaction === 'dislike' ? 'destructive' : 'outline'}
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Dislike' : 'Login to dislike'}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{comment.dislikesCount}</span>
                </Button>
              </div>

              {canReply && isAuthenticated && (
                <Button
                  onClick={() => setIsReplying(!isReplying)}
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  <Reply className="h-3.5 w-3.5" />
                  {isReplying ? 'Cancel' : 'Reply'}
                </Button>
              )}
            </div>
          </>
        )}

        {isReplying && (
          <div className="mt-4 pt-4 border-t">
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
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3 pt-3">
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

export default CommentItem;
