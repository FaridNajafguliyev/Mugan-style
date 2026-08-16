import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", requireAuth, requireRole("admin", "seller"), getStats);

export default router;
