export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_DISPATCH",
  "DISPATCHED_FROM_WAREHOUSE",
  "HANDED_TO_DELIVERY",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["NEW", "CANCELLED"],
  NEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_DISPATCH", "CANCELLED"],
  READY_FOR_DISPATCH: ["DISPATCHED_FROM_WAREHOUSE", "CANCELLED"],
  DISPATCHED_FROM_WAREHOUSE: ["HANDED_TO_DELIVERY"],
  HANDED_TO_DELIVERY: ["IN_TRANSIT", "RETURNED"],
  IN_TRANSIT: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

// Statuses at/after which stock has been committed (deducted from `stock`, not just reserved).
export const STOCK_COMMITTED_STATUSES: OrderStatus[] = ORDER_STATUSES.filter(
  (s) => s !== "PENDING_PAYMENT" && s !== "CANCELLED",
);
