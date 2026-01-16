import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './app';
import connectDB from './src/config/db';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      console.log(`
========================================
  Comment System API Server
========================================
  Environment: ${process.env.NODE_ENV || 'development'}
  Port: ${PORT}
  API: http://localhost:${PORT}/api
  Docs: http://localhost:${PORT}/api-docs
  Health: http://localhost:${PORT}/health
========================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
