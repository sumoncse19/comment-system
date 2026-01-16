import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

// Middleware imports
import { errorHandler } from './src/middleware/errorHandler';
import {
  helmetMiddleware,
  apiLimiter,
  xssProtection,
  noSqlInjectionProtection,
} from './src/middleware/security';

// Config imports
import swaggerSpec from './src/config/swagger';

// Route imports
import authRoutes from './src/routes/authRoutes';
import commentRoutes from './src/routes/commentRoutes';

const app: Application = express();

// ==================== Security Middleware ====================
app.use(helmetMiddleware);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==================== Body Parsing Middleware ====================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==================== Custom Security Middleware ====================
app.use(xssProtection);
app.use(noSqlInjectionProtection);

// ==================== Rate Limiting ====================
app.use('/api', apiLimiter);

// ==================== API Documentation ====================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Comment System API Docs',
}));

// ==================== Health Check ====================
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ==================== API Routes ====================
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Comment System API',
    version: '1.0.0',
    documentation: '/api-docs',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);

// ==================== 404 Handler ====================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// ==================== Global Error Handler ====================
app.use(errorHandler);

export default app;
