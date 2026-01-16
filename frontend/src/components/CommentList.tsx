import { useState, useEffect, useCallback } from 'react';
import type { Comment, PaginationMeta } from '../types';
import { commentApi } from '../api/commentApi';
import { useAuth } from '../contexts/AuthContext';
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
    // Reset to first page and refresh
    setPage(1);
    await fetchComments();
  };

  const handleReply = async (parentId: string, content: string) => {
    await commentApi.createComment({ content, pageId, parentComment: parentId });
    await fetchComments();
  };

  const handleUpdate = async (id: string, content: string) => {
    await commentApi.updateComment(id, { content });
    await fetchComments();
  };

  const handleDelete = async (id: string) => {
    await commentApi.deleteComment(id);
    await fetchComments();
  };

  const handleLike = async (id: string) => {
    await commentApi.likeComment(id);
    await fetchComments();
  };

  const handleDislike = async (id: string) => {
    await commentApi.dislikeComment(id);
    await fetchComments();
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h2>Comments {pagination && `(${pagination.totalItems})`}</h2>
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
