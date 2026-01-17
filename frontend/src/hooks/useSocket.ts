import { useEffect, useRef, useState } from 'react';
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
  const [isConnected, setIsConnected] = useState(false);

  // Store event handlers in refs to avoid reconnections when they change
  const handlersRef = useRef({
    onCommentCreated,
    onReplyCreated,
    onCommentUpdated,
    onCommentDeleted,
    onCommentLiked,
    onCommentDisliked,
  });

  // Update handlers ref when they change (without reconnecting)
  useEffect(() => {
    handlersRef.current = {
      onCommentCreated,
      onReplyCreated,
      onCommentUpdated,
      onCommentDeleted,
      onCommentLiked,
      onCommentDisliked,
    };
  }, [onCommentCreated, onReplyCreated, onCommentUpdated, onCommentDeleted, onCommentLiked, onCommentDisliked]);

  // Connection lifecycle - only depends on pageId
  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      // Join the page room
      socket.emit('join-page', pageId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Set up event listeners that use the refs
    socket.on(SOCKET_EVENTS.COMMENT_CREATED, (payload: CommentCreatedPayload) => {
      handlersRef.current.onCommentCreated?.(payload);
    });

    socket.on(SOCKET_EVENTS.REPLY_CREATED, (payload: ReplyCreatedPayload) => {
      handlersRef.current.onReplyCreated?.(payload);
    });

    socket.on(SOCKET_EVENTS.COMMENT_UPDATED, (payload: CommentUpdatedPayload) => {
      handlersRef.current.onCommentUpdated?.(payload);
    });

    socket.on(SOCKET_EVENTS.COMMENT_DELETED, (payload: CommentDeletedPayload) => {
      handlersRef.current.onCommentDeleted?.(payload);
    });

    socket.on(SOCKET_EVENTS.COMMENT_LIKED, (payload: CommentReactionPayload) => {
      handlersRef.current.onCommentLiked?.(payload);
    });

    socket.on(SOCKET_EVENTS.COMMENT_DISLIKED, (payload: CommentReactionPayload) => {
      handlersRef.current.onCommentDisliked?.(payload);
    });

    // Cleanup on unmount or pageId change
    return () => {
      socket.emit('leave-page', pageId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [pageId]); // Only reconnect when pageId changes

  return {
    socket: socketRef.current,
    isConnected,
  };
};
