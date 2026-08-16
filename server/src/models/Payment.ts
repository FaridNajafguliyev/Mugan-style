import { Schema, model } from "mongoose";

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

const paymentSchema = new Schema(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: { type: String, enum: ["yookassa"], required: true, default: "yookassa" },
    providerPaymentId: { type: String, index: true },
    amountKopecks: { type: Number, required: true },
    currency: { type: String, required: true, default: "RUB" },
    status: { type: String, enum: PAYMENT_STATUSES, required: true, default: "PENDING" },
    confirmationUrl: { type: String },
    idempotenceKey: { type: String, required: true },
    rawWebhookPayload: { type: Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const Payment = model("Payment", paymentSchema);
