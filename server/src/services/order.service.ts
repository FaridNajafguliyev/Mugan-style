import { Types } from "mongoose";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { OrderStatusHistory } from "../models/OrderStatusHistory.js";
import { nextOrderNumber } from "./counter.service.js";
import * as inventoryService from "./inventory.service.js";
import { AppError } from "../utils/AppError.js";
import { VALID_TRANSITIONS, type OrderStatus } from "../types/order.js";

export interface Actor {
  userId?: Types.ObjectId | string | null;
  label: string;
}

export interface CreateOrderInput {
  items: { productId: string; qty: number }[];
  contactName: string;
  contactPhone: string;
  customerEmail?: string;
  deliveryAddress: {
    city: string;
    street: string;
    house: string;
    apartment?: string;
    comment?: string;
  };
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items?.length) throw new AppError("Корзина пуста", 400);

  // `productId` on the wire is the public slug (the only product identifier
  // the frontend ever sees) — resolved here to the internal Mongo _id.
  const products = await Product.find({
    slug: { $in: input.items.map((i) => i.productId) },
    isActive: true,
  });

  if (products.length !== input.items.length) {
    throw new AppError("Один или несколько товаров недоступны", 400, "PRODUCT_UNAVAILABLE");
  }

  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const stockLines = input.items.map((i) => ({
    productId: productBySlug.get(i.productId)!._id,
    qty: i.qty,
  }));
  await inventoryService.reserveStock(stockLines);

  try {
    const orderItems = input.items.map((i) => {
      const product = productBySlug.get(i.productId)!;
      return {
        product: product._id,
        titleSnapshot: product.title,
        priceKopecksSnapshot: product.priceKopecks,
        qty: i.qty,
        imageSnapshot: product.images[0],
      };
    });

    const subtotalKopecks = orderItems.reduce((sum, i) => sum + i.priceKopecksSnapshot * i.qty, 0);
    const deliveryFeeKopecks = 0;
    const totalKopecks = subtotalKopecks + deliveryFeeKopecks;

    const customer = await Customer.findOneAndUpdate(
      { phone: input.contactPhone },
      { $set: { name: input.contactName, phone: input.contactPhone, email: input.customerEmail } },
      { upsert: true, new: true },
    );

    const orderNumber = await nextOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: customer._id,
      items: orderItems,
      subtotalKopecks,
      deliveryFeeKopecks,
      totalKopecks,
      status: "PENDING_PAYMENT",
      deliveryAddress: input.deliveryAddress,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
    });

    await OrderStatusHistory.create({
      order: order._id,
      fromStatus: null,
      toStatus: "PENDING_PAYMENT",
      changedBy: null,
      changedByLabel: "customer",
      note: "Заказ создан",
    });

    return order;
  } catch (err) {
    await inventoryService.releaseStock(stockLines);
    throw err;
  }
}

export async function changeStatus(
  orderId: string,
  toStatus: OrderStatus,
  actor: Actor,
  note?: string,
) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Заказ не найден", 404);

  const fromStatus = order.status as OrderStatus;
  const allowed = VALID_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(`Недопустимый переход статуса: ${fromStatus} → ${toStatus}`, 409, "INVALID_TRANSITION");
  }

  const stockLines = order.items.map((i) => ({ productId: i.product, qty: i.qty }));

  if (toStatus === "CANCELLED") {
    if (fromStatus === "PENDING_PAYMENT") {
      await inventoryService.releaseStock(stockLines);
    } else {
      await inventoryService.restockAfterCancel(stockLines);
    }
  } else if (fromStatus === "PENDING_PAYMENT" && toStatus === "NEW") {
    await inventoryService.commitStock(stockLines);
  }

  order.status = toStatus;
  await order.save();

  await OrderStatusHistory.create({
    order: order._id,
    fromStatus,
    toStatus,
    changedBy: actor.userId ?? null,
    changedByLabel: actor.label,
    note,
  });

  return order;
}

export async function getOrderById(orderId: string) {
  const order = await Order.findById(orderId).populate("customer").populate("delivery");
  if (!order) throw new AppError("Заказ не найден", 404);
  return order;
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await Order.findOne({ orderNumber });
  if (!order) throw new AppError("Заказ не найден", 404);
  return order;
}

export async function getOrderHistory(orderId: string) {
  return OrderStatusHistory.find({ order: orderId }).sort({ createdAt: 1 }).populate("changedBy", "name");
}

export async function listOrders(params: { status?: string; page?: number; limit?: number }) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const query: Record<string, unknown> = {};
  if (params.status) query.status = params.status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("customer"),
    Order.countDocuments(query),
  ]);

  return { orders, total, page, limit };
}

export async function trackOrder(orderNumber: string, phone: string) {
  const order = await Order.findOne({ orderNumber, contactPhone: phone });
  if (!order) throw new AppError("Заказ не найден. Проверьте номер и телефон.", 404);
  const history = await getOrderHistory(String(order._id));
  return { order, history };
}
