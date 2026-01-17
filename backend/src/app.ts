import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

// Middleware imports
import { errorHandler } from './middleware/errorHandler';
import {
  helmetMiddleware,
  apiLimiter,
  xssProtection,
  noSqlInjectionProtection,
  csrfProtection,
  additionalSecurityHeaders,
} from './middleware/security';

// Config imports
import swaggerSpec from './config/swagger';
import { CORS_OPTIONS } from './config/security';

// Route imports
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';

const app: Application = express();

// ==================== Security Middleware ====================
app.use(helmetMiddleware);
app.use(additionalSecurityHeaders);

// CORS with credentials (allows cookies)
app.use(cors(CORS_OPTIONS));

// ==================== Cookie Parser ====================
app.use(cookieParser());

// ==================== Body Parsing Middleware ====================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==================== Custom Security Middleware ====================
app.use(xssProtection);
app.use(noSqlInjectionProtection);

// ==================== CSRF Protection ====================
// Validate CSRF token for state-changing requests (POST, PUT, DELETE, PATCH)
// Token is provided in login/register response and sent via X-CSRF-Token header
app.use(csrfProtection);

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
