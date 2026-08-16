import { Router } from "express";
import { upsertDelivery, listDeliveries } from "../controllers/delivery.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin", "seller"));
router.get("/", listDeliveries);
router.patch("/:orderId", upsertDelivery);

export default router;
