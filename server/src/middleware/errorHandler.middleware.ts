import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten() });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
}
