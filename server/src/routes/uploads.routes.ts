import { Router } from "express";
import { uploadProductImages } from "../controllers/upload.controller.js";
import { uploadImages } from "../middleware/upload.middleware.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/product-images",
  requireAuth,
  requireRole("admin", "seller"),
  uploadImages.array("images", 8),
  uploadProductImages,
);

export default router;
