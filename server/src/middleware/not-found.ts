import type { Request, Response } from "express";

export function notFoundHandler(request: Request, response: Response) {
  return response.status(404).json({
    error: "NotFound",
    message: `Route ${request.method} ${request.path} was not found`,
  });
}
