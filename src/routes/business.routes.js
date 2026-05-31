import { Router } from "express";
import { getBusiness, updateBusiness } from "../controllers/business.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/me", getBusiness);
router.patch("/me", updateBusiness);

export default router;
