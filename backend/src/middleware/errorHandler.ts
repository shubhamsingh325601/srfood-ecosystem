import type { NextFunction, Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { ZodError } from 'zod';

import { config } from '@/config/index';
import type { ApiErrorResponse } from '@/types/api.types';
import { AppError, ConflictError, ValidationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export function notFoundHandler(req: Request, res: Response): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.originalUrl}` },
  };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let normalized: AppError;

  if (err instanceof AppError) {
    normalized = err;
  } else if (err instanceof ZodError) {
    normalized = new ValidationError(
      'Validation failed',
      err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  } else if (err instanceof MongooseError.ValidationError) {
    normalized = new ValidationError('Validation failed', err.errors);
  } else if (err instanceof MongooseError.CastError) {
    normalized = new ValidationError(`Invalid value for field "${err.path}"`);
  } else if (err instanceof MongoServerError && err.code === 11000) {
    normalized = new ConflictError('Duplicate value violates a unique constraint', err.keyValue);
  } else {
    const message = err instanceof Error ? err.message : 'Internal server error';
    normalized = new AppError(500, 'INTERNAL_SERVER_ERROR', config.app.isProduction ? 'Internal server error' : message);
  }

  if (normalized.statusCode >= 500) {
    logger.error(normalized.message, {
      requestId: req.requestId,
      path: req.originalUrl,
      method: req.method,
      stack: err instanceof Error ? err.stack : undefined,
    });
  } else {
    logger.warn(normalized.message, { requestId: req.requestId, path: req.originalUrl, code: normalized.code });
  }

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {}),
    },
  };
  res.status(normalized.statusCode).json(body);
}
