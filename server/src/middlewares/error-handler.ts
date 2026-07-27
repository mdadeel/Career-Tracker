import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import pino from "pino";
import * as Sentry from "@sentry/node";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors[0]?.message || "Validation failed",
      errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Report unexpected errors to Sentry in production
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }

  logger.error({ err, path: _req.path }, "Unhandled error");

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}

