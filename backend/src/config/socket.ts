import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

// Socket event types
export interface CommentEventPayload {
  pageId: string;
  comment?: unknown;
  commentId?: string;
  parentId?: string;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  // Parse CLIENT_URL to support multiple origins (comma-separated)
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = clientUrl.split(',').map((url) => url.trim());

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific page room for targeted updates
    socket.on('join-page', (pageId: string) => {
      socket.join(`page:${pageId}`);
      console.log(`Socket ${socket.id} joined page: ${pageId}`);
    });

    // Leave a page room
    socket.on('leave-page', (pageId: string) => {
      socket.leave(`page:${pageId}`);
      console.log(`Socket ${socket.id} left page: ${pageId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit events to specific page rooms
export const emitToPage = (pageId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`page:${pageId}`).emit(event, data);
  }
};

// Socket event names
export const SOCKET_EVENTS = {
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  COMMENT_LIKED: 'comment:liked',
  COMMENT_DISLIKED: 'comment:disliked',
  REPLY_CREATED: 'reply:created',
} as const;
