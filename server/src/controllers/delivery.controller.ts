import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as deliveryService from "../services/delivery.service.js";
import { DELIVERY_STATUSES } from "../models/Delivery.js";

const upsertSchema = z.object({
  company: z.string().optional(),
  trackingNumber: z.string().optional(),
  status: z.enum(DELIVERY_STATUSES).optional(),
  notes: z.string().optional(),
});

export const upsertDelivery = asyncHandler(async (req: Request, res: Response) => {
  const input = upsertSchema.parse(req.body);
  const delivery = await deliveryService.upsertDeliveryForOrder(req.params.orderId, input);
  res.json({ delivery });
});

export const listDeliveries = asyncHandler(async (_req: Request, res: Response) => {
  const deliveries = await deliveryService.listDeliveries();
  res.json({ deliveries });
});
