import { Router } from "express";
import { history, webhook } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/webhook", webhook);
router.get("/history", protect, history);

export default router;
