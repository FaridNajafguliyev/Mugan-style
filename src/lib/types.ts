export interface SizeAvailability {
  size: string;
  available: number;
}

export interface Product {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  color?: string;
  sizes: string;
  sizeStock: SizeAvailability[];
  priceKopecks: number;
  oldPriceKopecks?: number;
  priceFrom: boolean;
  description: string;
  images: string[];
  available: number;
}

export interface Category {
  key: string;
  label: string;
}

export interface AdminProduct {
  id: string;
  categoryKey: string;
  categoryLabel: string;
  title: string;
  material: string;
  lining: string;
  color?: string;
  sizes: string;
  priceKopecks: number;
  oldPriceKopecks?: number;
  priceFrom: boolean;
  description: string;
  images: string[];
  isActive: boolean;
  available: number;
}

export interface ProductFormInput {
  categoryKey: string;
  title: string;
  material: string;
  lining: string;
  color: string;
  sizes: string;
  priceKopecks: number;
  oldPriceKopecks: number | null;
  priceFrom: boolean;
  description: string;
  images: string[];
}

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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Ожидает оплаты",
  NEW: "Новый",
  ACCEPTED: "Принят",
  PREPARING: "Готовится",
  READY_FOR_DISPATCH: "Готов к отправке",
  DISPATCHED_FROM_WAREHOUSE: "Отправлен со склада",
  HANDED_TO_DELIVERY: "Передан в доставку",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  RETURNED: "Возврат",
};

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

export interface OrderItemLine {
  product: string;
  titleSnapshot: string;
  priceKopecksSnapshot: number;
  size: string;
  qty: number;
  imageSnapshot?: string;
}

export interface AdminCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  customer: AdminCustomer;
  items: OrderItemLine[];
  subtotalKopecks: number;
  deliveryFeeKopecks: number;
  totalKopecks: number;
  deliveryAddress: { city: string; street: string; house: string; apartment?: string; comment?: string };
  contactName: string;
  contactPhone: string;
  delivery?: Delivery | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderHistoryEntry {
  _id: string;
  order: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByLabel: string;
  note?: string;
  createdAt: string;
}

export const DELIVERY_STATUSES = ["PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED", "RETURNED"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Ожидает отправки",
  DISPATCHED: "Отправлено",
  IN_TRANSIT: "В пути",
  DELIVERED: "Доставлено",
  RETURNED: "Возврат",
};

export interface Delivery {
  _id: string;
  order: string | { _id: string; orderNumber: string; status: OrderStatus; contactName: string; contactPhone: string };
  company?: string;
  trackingNumber?: string;
  status: DeliveryStatus;
  notes?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface InventorySizeRow {
  size: string;
  stock: number;
  reserved: number;
  available: number;
}

export interface InventoryProductGroup {
  productId: string;
  productSlug: string;
  title: string;
  sku: string;
  sizes: InventorySizeRow[];
}

export interface AdminCustomerRow {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  ordersCount: number;
  totalSpentKopecks: number;
}

export interface ContactLead {
  _id: string;
  name: string;
  phone: string;
  model?: string;
  message?: string;
  createdAt: string;
}
