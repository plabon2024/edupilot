/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodError } from 'zod';

/**
 * Generic Zod validation middleware.
 * Validates req.body against the provided schema.
 * On failure, passes a ZodError to the global error handler (→ handleZodError).
 * On success, replaces req.body with the parsed (stripped) data.
 */
export const validateRequest =
  (schema: ZodObject<any, any>) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Support multipart/form-data where JSON was stringified into a "data" field
      if (req.body?.data && typeof req.body.data === 'string') {
        req.body = JSON.parse(req.body.data);
      }

      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(error);
      } else {
        next(error);
      }
    }
  };