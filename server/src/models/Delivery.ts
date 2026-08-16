import { Schema, model } from "mongoose";

const DELIVERY_STATUSES = ["PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "RETURNED"] as const;

const deliverySchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    company: { type: String },
    trackingNumber: { type: String },
    status: { type: String, enum: DELIVERY_STATUSES, required: true, default: "PENDING" },
    notes: { type: String },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export { DELIVERY_STATUSES };
export const Delivery = model("Delivery", deliverySchema);
