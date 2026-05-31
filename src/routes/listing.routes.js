import { Router } from "express";
import {
  createListing,
  deleteListing,
  duplicateListing,
  getListing,
  listListings,
  marketingAssets,
  setStatus,
  updateListing
} from "../controllers/listing.controller.js";
import { protect, requirePermission } from "../middleware/auth.middleware.js";
import { listingUpload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { listingSchema } from "../validators/listing.validators.js";

const router = Router();

router.use(protect);
router.get("/", listListings);
router.post("/", requirePermission("listings:write"), listingUpload, validate(listingSchema), createListing);
router.get("/:id", getListing);
router.patch("/:id", requirePermission("listings:write"), listingUpload, updateListing);
router.delete("/:id", requirePermission("listings:delete"), deleteListing);
router.post("/:id/:action(archive|publish|pause)", requirePermission("listings:write"), setStatus);
router.post("/:id/duplicate", requirePermission("listings:write"), duplicateListing);
router.get("/:id/marketing-assets", marketingAssets);

export default router;
