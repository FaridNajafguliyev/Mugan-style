import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

// Published YooKassa notification IP ranges (see yookassa.ru API docs).
// This is a defense-in-depth check only — the real trust boundary is
// payment.service.handleWebhook re-fetching the payment status from
// YooKassa with our own shop credentials before acting on anything.
const YOOKASSA_CIDRS = [
  "185.71.76.0/27",
  "185.71.77.0/27",
  "77.75.153.0/25",
  "77.75.156.11/32",
  "77.75.156.35/32",
  "77.75.154.128/25",
];

function ipToLong(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipLong = ipToLong(ip);
  const rangeLong = ipToLong(range);
  if (ipLong === null || rangeLong === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipLong & mask) === (rangeLong & mask);
}

export function requireYooKassaIp(req: Request, res: Response, next: NextFunction): void {
  // Local/dev tunnels (ngrok etc.) don't originate from YooKassa's IP ranges,
  // so only enforce this in production where the real allowlist applies.
  if (env.NODE_ENV !== "production") return next();

  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() || req.ip || "";
  const allowed = YOOKASSA_CIDRS.some((cidr) => isInCidr(ip, cidr));

  if (!allowed) {
    console.warn(`[webhook] rejected notification from non-YooKassa IP: ${ip}`);
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
