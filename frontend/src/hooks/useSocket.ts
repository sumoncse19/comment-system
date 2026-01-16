import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Comment } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// Socket event types
export const SOCKET_EVENTS = {
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  COMMENT_LIKED: 'comment:liked',
  COMMENT_DISLIKED: 'comment:disliked',
  REPLY_CREATED: 'reply:created',
} as const;

export interface CommentCreatedPayload {
  comment: Comment;
}

export interface ReplyCreatedPayload {
  comment: Comment;
  parentId: string;
}

export interface CommentUpdatedPayload {
  comment: Comment;
}

export interface CommentDeletedPayload {
  commentId: string;
  parentId: string | null;
}

export interface CommentReactionPayload {
  comment: Comment;
}

interface UseSocketOptions {
  pageId: string;
  onCommentCreated?: (payload: CommentCreatedPayload) => void;
  onReplyCreated?: (payload: ReplyCreatedPayload) => void;
  onCommentUpdated?: (payload: CommentUpdatedPayload) => void;
  onCommentDeleted?: (payload: CommentDeletedPayload) => void;
  onCommentLiked?: (payload: CommentReactionPayload) => void;
  onCommentDisliked?: (payload: CommentReactionPayload) => void;
}

export const useSocket = ({
  pageId,
  onCommentCreated,
  onReplyCreated,
  onCommentUpdated,
  onCommentDeleted,
  onCommentLiked,
  onCommentDisliked,
}: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
      // Join the page room
      socketRef.current?.emit('join-page', pageId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Set up event listeners
    if (onCommentCreated) {
      socketRef.current.on(SOCKET_EVENTS.COMMENT_CREATED, onCommentCreated);
    }
    if (onReplyCreated) {
      socketRef.current.on(SOCKET_EVENTS.REPLY_CREATED, onReplyCreated);
    }
    if (onCommentUpdated) {
      socketRef.current.on(SOCKET_EVENTS.COMMENT_UPDATED, onCommentUpdated);
    }
    if (onCommentDeleted) {
      socketRef.current.on(SOCKET_EVENTS.COMMENT_DELETED, onCommentDeleted);
    }
    if (onCommentLiked) {
      socketRef.current.on(SOCKET_EVENTS.COMMENT_LIKED, onCommentLiked);
    }
    if (onCommentDisliked) {
      socketRef.current.on(SOCKET_EVENTS.COMMENT_DISLIKED, onCommentDisliked);
    }
  }, [pageId, onCommentCreated, onReplyCreated, onCommentUpdated, onCommentDeleted, onCommentLiked, onCommentDisliked]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave-page', pageId);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, [pageId]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
};
