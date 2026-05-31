import { Router } from "express";
import { listingAnalytics, overview } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/overview", overview);
router.get("/listings/:id", listingAnalytics);

export default router;
