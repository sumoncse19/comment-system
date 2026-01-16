import { useState } from 'react';
import type { FormEvent } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  initialValue?: string;
  onCancel?: () => void;
  isReply?: boolean;
}

const CommentForm = ({
  onSubmit,
  placeholder = 'Write a comment...',
  buttonText = 'Post Comment',
  initialValue = '',
  onCancel,
  isReply = false,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`comment-form ${isReply ? 'comment-form-reply' : ''}`}>
      {error && <div className="alert alert-error">{error}</div>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="comment-textarea"
        rows={isReply ? 2 : 3}
        disabled={isSubmitting}
      />
      <div className="comment-form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : buttonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
