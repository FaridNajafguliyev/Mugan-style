import { Schema, model } from "mongoose";
import { ORDER_STATUSES } from "../types/order.js";

const orderStatusHistorySchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    fromStatus: { type: String, enum: ORDER_STATUSES, default: null },
    toStatus: { type: String, enum: ORDER_STATUSES, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    changedByLabel: { type: String, required: true },
    note: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const OrderStatusHistory = model("OrderStatusHistory", orderStatusHistorySchema);
