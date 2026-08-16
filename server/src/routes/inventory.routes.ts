import { Router } from "express";
import { listInventory, setStock } from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin", "seller"));
router.get("/", listInventory);
router.patch("/:id", setStock);

export default router;
