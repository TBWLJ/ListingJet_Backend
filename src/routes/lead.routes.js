import { Router } from "express";
import { addNote, getLead, listLeads, updateLead } from "../controllers/lead.controller.js";
import { protect, requirePermission } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.get("/", listLeads);
router.get("/:id", getLead);
router.patch("/:id", requirePermission("leads:write"), updateLead);
router.post("/:id/notes", requirePermission("leads:write"), addNote);

export default router;
