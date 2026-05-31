import { Router } from "express";
import { countries, states } from "../controllers/location.controller.js";

const router = Router();

router.get("/countries", countries);
router.get("/states", states);

export default router;
