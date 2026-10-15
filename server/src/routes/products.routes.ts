import { Router } from "express";
import {
  listProducts,
  getProduct,
  listProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public catalog.
router.get("/", listProducts);

// Admin — fixed two-segment path, registered before the public `/:slug` so
// it can never be swallowed by it (Express matches `/:slug` only against a
// single path segment).
router.get("/admin/list", requireAuth, requireRole("admin", "seller"), listProductsAdmin);
router.post("/", requireAuth, requireRole("admin", "seller"), createProduct);
router.patch("/:slug", requireAuth, requireRole("admin", "seller"), updateProduct);
router.delete("/:slug", requireAuth, requireRole("admin", "seller"), deleteProduct);

// Public product detail — must stay after the admin routes above.
router.get("/:slug", getProduct);

export default router;
