import { Router } from "express";
import { listInventory, setSizeStock, addSize, removeSize, updateSku } from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin", "seller"));
router.get("/", listInventory);
router.patch("/:productId", updateSku);
router.post("/:productId/sizes", addSize);
router.patch("/:productId/sizes/:size", setSizeStock);
router.delete("/:productId/sizes/:size", removeSize);

export default router;
