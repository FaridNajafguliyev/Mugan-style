import { Router } from "express";
import { yookassaWebhook } from "../controllers/payment.controller.js";
import { requireYooKassaIp } from "../middleware/webhookAuth.middleware.js";

const router = Router();

router.post("/webhook/yookassa", requireYooKassaIp, yookassaWebhook);

export default router;
