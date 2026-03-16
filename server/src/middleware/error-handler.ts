import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    const flat = error.flatten();
    const fieldMessages = Object.entries(flat.fieldErrors)
      .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
      .join("; ");
    return response.status(400).json({
      error: "ValidationError",
      message: fieldMessages ? `Validation failed — ${fieldMessages}` : "Request validation failed",
      details: flat,
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      error: "HttpError",
      message: error.message,
      details: error.details,
    });
  }

  logger.error("Unhandled server error", {
    error: error instanceof Error ? error.message : "Unknown error",
  });

  return response.status(500).json({
    error: "InternalServerError",
    message: "An unexpected error occurred",
  });
}
