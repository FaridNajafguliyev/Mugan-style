import { Router } from "express";
import {
  createOrder,
  getOrderByNumberPublic,
  listOrders,
  getOrder,
  getOrderHistory,
  changeOrderStatus,
  deleteOrder,
  trackOrder,
} from "../controllers/order.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public: customer checkout creates a PENDING_PAYMENT order.
router.post("/", createOrder);

// Public: the post-payment result page polls this by order number (no auth —
// scoped to a handful of non-sensitive fields, see getOrderByNumberPublic).
router.get("/by-number/:orderNumber", getOrderByNumberPublic);

// Public: the /track-order page — order number + phone acts as the shared
// secret proving the requester is the customer, no account needed.
router.post("/track", trackOrder);

// Admin/seller only.
router.use(requireAuth, requireRole("admin", "seller"));
router.get("/", listOrders);
router.get("/:id", getOrder);
router.get("/:id/history", getOrderHistory);
router.patch("/:id/status", changeOrderStatus);
router.delete("/:id", requireRole("admin"), deleteOrder);

export default router;
