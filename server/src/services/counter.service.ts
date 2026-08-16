import { Counter } from "../models/Counter.js";

export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const counterId = `order-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );

  return `ORD-${year}-${String(counter.seq).padStart(6, "0")}`;
}
