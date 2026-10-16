import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as orderService from "../services/order.service.js";
import * as paymentService from "../services/payment.service.js";
import { ORDER_STATUSES } from "../types/order.js";

const createOrderSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), size: z.string().min(1), qty: z.number().int().min(1) }))
    .min(1),
  contactName: z.string().min(1),
  contactPhone: z.string().min(5),
  customerEmail: z.string().email().optional(),
  deliveryAddress: z.object({
    city: z.string().min(1),
    street: z.string().min(1),
    house: z.string().min(1),
    apartment: z.string().optional(),
    comment: z.string().optional(),
  }),
});

const changeStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
  note: z.string().optional(),
});

const trackOrderSchema = z.object({
  orderNumber: z.string().min(1),
  phone: z.string().min(5),
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const input = createOrderSchema.parse(req.body);
  const order = await orderService.createOrder(input);

  try {
    const { confirmationUrl } = await paymentService.createPaymentForOrder(String(order._id));
    res.status(201).json({
      orderNumber: order.orderNumber,
      status: order.status,
      totalKopecks: order.totalKopecks,
      confirmationUrl,
    });
  } catch (err) {
    await orderService.changeStatus(
      String(order._id),
      "CANCELLED",
      { label: "system:payment-init-failed" },
      "Не удалось создать платёж",
    );
    throw err;
  }
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const result = await orderService.listOrders({ status, page, limit });
  res.json(result);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json({ order });
});

export const getOrderHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await orderService.getOrderHistory(req.params.id);
  res.json({ history });
});

export const changeOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = changeStatusSchema.parse(req.body);
  const user = req.user;
  const order = await orderService.changeStatus(
    req.params.id,
    status as never,
    { userId: user?.id, label: user?.name ?? "admin" },
    note,
  );
  res.json({ order });
});

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber, phone } = trackOrderSchema.parse(req.body);
  const { order, history } = await orderService.trackOrder(orderNumber, phone);

  res.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      totalKopecks: order.totalKopecks,
      items: order.items.map((i) => ({ title: i.titleSnapshot, size: i.size, qty: i.qty, image: i.imageSnapshot })),
      createdAt: order.createdAt,
    },
    history: history.map((h) => ({ toStatus: h.toStatus, createdAt: h.createdAt })),
  });
});

export const getOrderByNumberPublic = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderByNumber(req.params.orderNumber);
  res.json({ orderNumber: order.orderNumber, status: order.status, totalKopecks: order.totalKopecks });
});
