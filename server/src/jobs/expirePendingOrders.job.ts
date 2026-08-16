import cron from "node-cron";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { yookassaProvider } from "../payments/providers/yookassa.provider.js";
import * as orderService from "../services/order.service.js";

const EXPIRY_MINUTES = 30;

async function expireStaleOrders(): Promise<void> {
  const cutoff = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);
  const staleOrders = await Order.find({ status: "PENDING_PAYMENT", createdAt: { $lt: cutoff } });

  for (const order of staleOrders) {
    try {
      // Self-heal a possibly-missed webhook before giving up on the order.
      if (order.payment) {
        const payment = await Payment.findById(order.payment);
        if (payment?.providerPaymentId) {
          const result = await yookassaProvider.getPayment(payment.providerPaymentId);
          if (result.status === "succeeded" && result.paid) {
            payment.status = "PAID";
            payment.paidAt = new Date();
            await payment.save();
            await orderService.changeStatus(String(order._id), "NEW", {
              label: "system:cron",
            }, "Оплата подтверждена при проверке просроченных заказов");
            continue;
          }
        }
      }

      await orderService.changeStatus(String(order._id), "CANCELLED", {
        label: "system:cron",
      }, `Заказ отменён — оплата не поступила в течение ${EXPIRY_MINUTES} минут`);
    } catch (err) {
      console.error(`[cron] failed to expire order ${order.orderNumber}`, err);
    }
  }
}

export function startExpirePendingOrdersJob(): void {
  cron.schedule("*/5 * * * *", () => {
    expireStaleOrders().catch((err) => console.error("[cron] expirePendingOrders failed", err));
  });
}
