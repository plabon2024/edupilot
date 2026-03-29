/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from '../../generated/prisma/client';

import config from "../config";
import AppError from "../errors/AppError";
import handlePrismaError from "../errors/handlePrismaError";
import handlePrismaValidationError from "../errors/handlePrismaValidationError";
import handleZodError from "../errors/handleZodError";
import { TErrorSources } from "../interface/error";
import { cleanupCloudinaryOnError } from "./cleanupCloudinaryOnError";
import multer from "multer";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Clean up any orphaned Cloudinary uploads from failed requests
  cleanupCloudinaryOnError(req);

  // Setting default values
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "",
      message: "Something went wrong",
    },
  ];

  // Zod validation errors
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Prisma Known Request Errors (constraint violations, not found, etc.)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Prisma Validation Errors (schema mismatch)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  }
  // Prisma Initialization Error
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message = "Database Connection Error";
    errorSources = [
      {
        path: "",
        message: "Unable to connect to the database",
      },
    ];
  }
  // Custom App Error
  else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err?.message,
      },
    ];
  }

  // Multer Error
  else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.message;
    errorSources = [
      {
        path: err.field || "",
        message: err.message,
      },
    ];
  }
  // Generic Error
  else if (err instanceof Error) {
    message = err.message;
    
    // Attempt to handle Google SDK ApiError JSON strings
    try {
      if (typeof message === 'string' && message.startsWith('{') && message.includes('"error"')) {
        const parsed = JSON.parse(message);
        if (parsed?.error?.message) {
          message = parsed.error.message;
          if (parsed.error.code) statusCode = parsed.error.code;
        }
      }
    } catch (_) {
      // Ignore parse errors
    }

    errorSources = [
      {
        path: "",
        message,
      },
    ];
  }
  // Caught a raw object with a message property (e.g., Cloudinary API errors)
  else if (err && typeof err === 'object' && 'message' in err) {
    message = String((err ).message);
    errorSources = [
      {
        path: "",
        message: String((err ).message),
      },
    ];
  }
  // Caught a raw string thrown as an error
  else if (typeof err === 'string') {
    message = err;
    errorSources = [
      {
        path: "",
        message: err,
      },
    ];
  }

  // Helpful server log for unhandled/generic errors
  console.error('[GlobalErrorHandler]', err);

  // Ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;

/*
Response Pattern:
{
  success: false,
  message: "Error message",
  errorSources: [
    {
      path: "field_name",
      message: "Specific error message"
    }
  ],
  stack: "..." // Only in development
}
*/
