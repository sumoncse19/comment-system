import api from './axios';
import type {
  ApiResponse,
  CommentResponse,
  CommentsResponse,
  CreateCommentInput,
  UpdateCommentInput,
  CommentQueryParams,
} from '../types';

export const commentApi = {
  // Get comments for a page
  getComments: async (params: CommentQueryParams) => {
    const queryString = new URLSearchParams({
      pageId: params.pageId,
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.sort && { sort: params.sort }),
    }).toString();

    const response = await api.get<ApiResponse<CommentsResponse>>(
      `/comments?${queryString}`
    );
    return response.data;
  },

  // Get a single comment
  getComment: async (id: string) => {
    const response = await api.get<ApiResponse<CommentResponse>>(
      `/comments/${id}`
    );
    return response.data;
  },

  // Create a new comment
  createComment: async (data: CreateCommentInput) => {
    const response = await api.post<ApiResponse<CommentResponse>>(
      '/comments',
      data
    );
    return response.data;
  },

  // Update a comment
  updateComment: async (id: string, data: UpdateCommentInput) => {
    const response = await api.put<ApiResponse<CommentResponse>>(
      `/comments/${id}`,
      data
    );
    return response.data;
  },

  // Delete a comment
  deleteComment: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/comments/${id}`);
    return response.data;
  },

  // Like a comment
  likeComment: async (id: string) => {
    const response = await api.post<ApiResponse<CommentResponse>>(
      `/comments/${id}/like`
    );
    return response.data;
  },

  // Dislike a comment
  dislikeComment: async (id: string) => {
    const response = await api.post<ApiResponse<CommentResponse>>(
      `/comments/${id}/dislike`
    );
    return response.data;
  },
};
