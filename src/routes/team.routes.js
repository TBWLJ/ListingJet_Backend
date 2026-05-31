import { Router } from "express";
import { invite, removeMember, team, updateMember } from "../controllers/team.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("business_owner", "super_admin"));
router.get("/", team);
router.post("/invite", invite);
router.patch("/:id", updateMember);
router.delete("/:id", removeMember);

export default router;
