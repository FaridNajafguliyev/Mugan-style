import { Delivery, DELIVERY_STATUSES, type DeliveryStatus } from "../models/Delivery.js";
import { Order } from "../models/Order.js";
import { AppError } from "../utils/AppError.js";

export interface UpsertDeliveryInput {
  company?: string;
  trackingNumber?: string;
  status?: DeliveryStatus;
  notes?: string;
}

export async function upsertDeliveryForOrder(orderId: string, input: UpsertDeliveryInput) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Заказ не найден", 404);

  const update: Record<string, unknown> = { ...input };
  if (input.status === "DISPATCHED") update.dispatchedAt = new Date();
  if (input.status === "DELIVERED") update.deliveredAt = new Date();

  const delivery = await Delivery.findOneAndUpdate(
    { order: order._id },
    { $set: update, $setOnInsert: { order: order._id } },
    { upsert: true, new: true },
  );

  if (!order.delivery) {
    order.delivery = delivery._id;
    await order.save();
  }

  return delivery;
}

export async function listDeliveries() {
  return Delivery.find()
    .populate("order", "orderNumber status contactName contactPhone")
    .sort({ updatedAt: -1 });
}

export { DELIVERY_STATUSES };
