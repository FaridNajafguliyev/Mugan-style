import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const REFRESH_COOKIE = "ms_refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "seller"]),
});

function setRefreshCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === "production";
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    // The deployed frontend (vercel.app) and backend (onrender.com) are on
    // different domains, so this is a cross-site request from the browser's
    // point of view — SameSite=Lax silently drops the cookie on every fetch,
    // which is what was forcing admins to log in again on every reload.
    // SameSite=None requires Secure, which is only available over HTTPS in
    // production; local dev keeps Lax since both run on http://localhost.
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/auth",
  });
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const { accessToken, refreshToken, user } = await authService.login(email, password);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new AppError("Сессия истекла, войдите снова", 401);
  const { accessToken, user } = await authService.refreshAccessToken(token);
  res.json({ accessToken, user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ ok: true });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const input = createUserSchema.parse(req.body);
  const user = await authService.createUser(input);
  res.status(201).json({ user });
});
