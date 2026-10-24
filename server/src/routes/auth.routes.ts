import { Router } from "express";
import { login, refresh, logout, createUser } from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import { loginRateLimit } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/login", loginRateLimit, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// No public self-registration — only an authenticated admin may create
// further admin/seller accounts. The very first admin is seeded via
// `npm run seed:admin` (server/src/scripts/createAdmin.ts).
router.post("/users", requireAuth, requireRole("admin"), createUser);

export default router;
