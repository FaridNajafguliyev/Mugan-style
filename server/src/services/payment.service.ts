import crypto from "node:crypto";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { yookassaProvider } from "../payments/providers/yookassa.provider.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import * as orderService from "./order.service.js";

const provider = yookassaProvider;

export async function createPaymentForOrder(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Заказ не найден", 404);
  if (order.status !== "PENDING_PAYMENT") {
    throw new AppError("Заказ уже оплачен или отменён", 409, "ORDER_NOT_PAYABLE");
  }

  const idempotenceKey = crypto.randomUUID();
  const returnUrl = env.YOOKASSA_RETURN_URL.replace(":orderNumber", order.orderNumber);

  const result = await provider.createPayment({
    amountKopecks: order.totalKopecks,
    description: `Заказ ${order.orderNumber} — Mugan Style`,
    orderNumber: order.orderNumber,
    returnUrl,
    idempotenceKey,
  });

  const payment = await Payment.create({
    order: order._id,
    provider: "yookassa",
    providerPaymentId: result.providerPaymentId,
    amountKopecks: order.totalKopecks,
    currency: "RUB",
    status: "PENDING",
    confirmationUrl: result.confirmationUrl,
    idempotenceKey,
  });

  order.payment = payment._id;
  await order.save();

  return { confirmationUrl: result.confirmationUrl, orderNumber: order.orderNumber };
}

/**
 * Never trusts the webhook body's status directly — re-fetches the payment
 * from YooKassa using our own shop credentials and acts only on that
 * authoritative response, so a spoofed webhook POST can't fake a PAID
 * transition even if it slips past the IP allowlist.
 */
export async function handleWebhook(providerPaymentId: string, rawPayload: unknown): Promise<void> {
  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) return; // unknown payment id — ignore

  if (payment.status === "PAID" || payment.status === "FAILED") return; // already terminal, idempotent no-op

  const authoritative = await provider.getPayment(providerPaymentId);
  payment.rawWebhookPayload = rawPayload;

  if (authoritative.status === "succeeded" && authoritative.paid) {
    payment.status = "PAID";
    payment.paidAt = new Date();
    await payment.save();
    await orderService.changeStatus(String(payment.order), "NEW", {
      label: "system:webhook",
    }, "Оплата подтверждена YooKassa");
  } else if (authoritative.status === "canceled") {
    payment.status = "FAILED";
    await payment.save();
    await orderService.changeStatus(String(payment.order), "CANCELLED", {
      label: "system:webhook",
    }, "Оплата отменена YooKassa");
  } else {
    await payment.save();
  }
}
