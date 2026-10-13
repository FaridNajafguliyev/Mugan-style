import { Router } from "express";
import productsRoutes from "./products.routes.js";
import categoriesRoutes from "./categories.routes.js";
import ordersRoutes from "./orders.routes.js";
import paymentsRoutes from "./payments.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import customersRoutes from "./customers.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import uploadsRoutes from "./uploads.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/orders", ordersRoutes);
router.use("/payments", paymentsRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/customers", customersRoutes);
router.use("/delivery", deliveryRoutes);
router.use("/uploads", uploadsRoutes);

export default router;
