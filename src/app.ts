import compression from 'compression';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { config } from '@/config/index';
import { swaggerSpec } from '@/config/swagger';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { publicRateLimiter } from '@/middleware/rateLimiter';
import { requestLogger } from '@/middleware/requestLogger';
import { apiRouter } from '@/routes/index';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  app.use(publicRateLimiter);

  if (config.swagger.enabled && !config.app.isProduction) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(`/api/${config.app.apiVersion}`, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
