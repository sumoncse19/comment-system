import { useState, memo } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isSubmitting && content.trim()) {
        handleSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${isReply ? 'mt-3' : 'mb-6'}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${placeholder} (Ctrl+Enter to submit)`}
        rows={isReply ? 2 : 3}
        disabled={isSubmitting}
        className="resize-none"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="sm"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Posting...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </div>
    </form>
  );
};

/**
 * Memoized CommentForm component
 * Prevents unnecessary re-renders when parent components update
 */
export default memo(CommentForm);
