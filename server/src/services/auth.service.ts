import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export interface AccessTokenPayload {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}

export async function login(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
  if (!user) throw new AppError("Неверный email или пароль", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Неверный email или пароль", 401);

  const payload: AccessTokenPayload = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "seller",
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(String(user._id)),
    user: payload,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let decoded: { id: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Сессия истекла, войдите снова", 401);
  }

  const user = await User.findOne({ _id: decoded.id, isActive: true });
  if (!user) throw new AppError("Сессия истекла, войдите снова", 401);

  const payload: AccessTokenPayload = {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as "admin" | "seller",
  };

  return { accessToken: signAccessToken(payload), user: payload };
}

export async function createUser(input: { name: string; email: string; password: string; role: "admin" | "seller" }) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new AppError("Пользователь с таким email уже существует", 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
  });

  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}
