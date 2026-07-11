import { createApp } from '@/app';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { config } from '@/config/index';
import { logger } from '@/utils/logger';

/**
 * Process entry point (TRD 4.2). Connects to MongoDB, then binds the
 * Express app from `src/app.ts` to a port. No route/middleware logic
 * lives here — see `createApp()` for that.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  const server = app.listen(config.app.port, () => {
    logger.info(`SR Food API listening on port ${config.app.port}`, {
      env: config.app.nodeEnv,
      apiVersion: config.app.apiVersion,
    });
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      disconnectDatabase()
        .catch((error: unknown) => {
          logger.error('Error during database disconnect', {
            error: error instanceof Error ? error.message : error,
          });
        })
        .finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start server', { error: error instanceof Error ? error.message : error });
  process.exit(1);
});
