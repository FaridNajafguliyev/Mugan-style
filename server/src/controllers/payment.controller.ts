import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as paymentService from "../services/payment.service.js";

interface YooKassaWebhookBody {
  event?: string;
  object?: { id?: string };
}

export const yookassaWebhook = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as YooKassaWebhookBody;
  const providerPaymentId = body?.object?.id;

  if (providerPaymentId) {
    await paymentService.handleWebhook(providerPaymentId, body);
  }

  // Always 200 — YooKassa retries on non-2xx, and we've already handled
  // (or intentionally ignored) whatever it sent.
  res.status(200).json({ ok: true });
});
