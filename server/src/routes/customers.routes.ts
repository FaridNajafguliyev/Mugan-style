import { Router } from "express";
import { listCustomers, createLead, listLeads } from "../controllers/customer.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public: the Contact page form.
router.post("/leads", createLead);

// Admin/seller only.
router.get("/", requireAuth, requireRole("admin", "seller"), listCustomers);
router.get("/leads", requireAuth, requireRole("admin", "seller"), listLeads);

export default router;
