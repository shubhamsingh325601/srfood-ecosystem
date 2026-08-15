import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export interface ValidationSchemas {
  body?: ZodType | (() => ZodType);
  query?: ZodType | (() => ZodType);
  params?: ZodType | (() => ZodType);
}

function resolveSchema(schema: ZodType | (() => ZodType)): ZodType {
  return typeof schema === 'function' ? schema() : schema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schemas.body) {
      req.body = resolveSchema(schemas.body).parse(req.body);
    }
    if (schemas.query) {
      req.query = resolveSchema(schemas.query).parse(req.query) as typeof req.query;
    }
    if (schemas.params) {
      req.params = resolveSchema(schemas.params).parse(req.params) as typeof req.params;
    }
    next();
  };
}
