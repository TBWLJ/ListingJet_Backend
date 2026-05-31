import { Router } from "express";
import { cancel, current, plans, subscribe, verify } from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/plans", plans);
router.use(protect);
router.get("/current", current);
router.post("/subscribe", subscribe);
router.post("/verify", verify);
router.post("/cancel", cancel);

export default router;
