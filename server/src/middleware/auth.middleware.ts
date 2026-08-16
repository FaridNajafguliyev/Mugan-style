import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Требуется авторизация", 401);
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.user = payload;
    next();
  } catch {
    throw new AppError("Недействительный или истёкший токен", 401);
  }
}

export function requireRole(...roles: Array<"admin" | "seller">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Недостаточно прав", 403);
    }
    next();
  };
}
