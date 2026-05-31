import { Router } from "express";
import { campaign, event, report, submitLead } from "../controllers/public.controller.js";

const router = Router();

router.get("/campaign/:slug", campaign);
router.post("/campaign/:slug/lead", submitLead);
router.post("/campaign/:slug/event", event);
router.get("/report/:id", report);

export default router;
