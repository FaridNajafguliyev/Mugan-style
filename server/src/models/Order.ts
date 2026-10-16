import { Schema, model } from "mongoose";
import { ORDER_STATUSES } from "../types/order.js";

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    titleSnapshot: { type: String, required: true },
    priceKopecksSnapshot: { type: Number, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    imageSnapshot: { type: String },
  },
  { _id: false },
);

const deliveryAddressSchema = new Schema(
  {
    city: { type: String, required: true },
    street: { type: String, required: true },
    house: { type: String, required: true },
    apartment: { type: String },
    comment: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    subtotalKopecks: { type: Number, required: true },
    deliveryFeeKopecks: { type: Number, required: true, default: 0 },
    totalKopecks: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "PENDING_PAYMENT" },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    delivery: { type: Schema.Types.ObjectId, ref: "Delivery" },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true },
);

export const Order = model("Order", orderSchema);
