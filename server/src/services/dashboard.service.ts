import { Order } from "../models/Order.js";
import { ORDER_STATUSES } from "../types/order.js";

export async function getStats() {
  const [countsByStatus, revenueAgg] = await Promise.all([
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { status: { $nin: ["PENDING_PAYMENT", "CANCELLED"] } } },
      { $group: { _id: null, total: { $sum: "$totalKopecks" } } },
    ]),
  ]);

  const counts: Record<string, number> = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  for (const row of countsByStatus) counts[row._id] = row.count;

  return {
    counts,
    totalRevenueKopecks: revenueAgg[0]?.total ?? 0,
  };
}
