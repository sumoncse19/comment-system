import { useState } from 'react';
import type { Comment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  onLike: (id: string) => Promise<void>;
  onDislike: (id: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (parentId: string, content: string) => Promise<void>;
  isReply?: boolean;
}

const CommentItem = ({
  comment,
  onLike,
  onDislike,
  onUpdate,
  onDelete,
  onReply,
  isReply = false,
}: CommentItemProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?._id === comment.author._id;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          <div className="comment-avatar">
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.username} />
            ) : (
              <span>{comment.author.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="comment-meta">
            <span className="comment-username">{comment.author.username}</span>
            <span className="comment-date">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && <span className="comment-edited">(edited)</span>}
          </div>
        </div>

        {isOwner && !isEditing && (
          <div className="comment-actions-menu">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-icon"
              title="Edit"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-icon btn-danger"
              title="Delete"
              disabled={isDeleting}
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
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
        <div className="comment-content">
          <p>{comment.content}</p>
        </div>
      )}

      <div className="comment-footer">
        <div className="comment-reactions">
          <button
            onClick={() => onLike(comment._id)}
            className={`btn-reaction ${comment.userReaction === 'like' ? 'active' : ''}`}
            disabled={!isAuthenticated}
            title={isAuthenticated ? 'Like' : 'Login to like'}
          >
            <span className="reaction-icon">👍</span>
            <span className="reaction-count">{comment.likesCount}</span>
          </button>
          <button
            onClick={() => onDislike(comment._id)}
            className={`btn-reaction ${comment.userReaction === 'dislike' ? 'active' : ''}`}
            disabled={!isAuthenticated}
            title={isAuthenticated ? 'Dislike' : 'Login to dislike'}
          >
            <span className="reaction-icon">👎</span>
            <span className="reaction-count">{comment.dislikesCount}</span>
          </button>
        </div>

        {!isReply && isAuthenticated && (
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="btn-text"
          >
            {isReplying ? 'Cancel' : 'Reply'}
          </button>
        )}
      </div>

      {isReplying && (
        <div className="comment-reply-form">
          <CommentForm
            onSubmit={handleReply}
            placeholder="Write a reply..."
            buttonText="Reply"
            onCancel={() => setIsReplying(false)}
            isReply
          />
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onDislike={onDislike}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
