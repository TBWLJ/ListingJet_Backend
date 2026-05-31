import slugify from "slugify";
import Listing from "../models/Listing.js";
import Subscription from "../models/Subscription.js";
import { HttpError } from "../utils/httpError.js";
import { uploadImage, uploadVideo } from "../services/upload.service.js";
import { generateMarketingAssets } from "../services/marketing.service.js";
import Business from "../models/Business.js";

async function ensureLimit(business) {
  const subscription = await Subscription.findOne({ business });
  const active = await Listing.countDocuments({ business, status: "active" });
  if (subscription && active >= subscription.limits.activeListings) {
    throw new HttpError(403, "Active listing limit reached for this plan");
  }
}

export async function listListings(req, res) {
  const { q, status, listingType, sort = "-createdAt" } = req.query;
  const filter = { business: req.user.business };
  if (status) filter.status = status;
  if (listingType) filter.listingType = listingType;
  if (q) filter.$text = { $search: q };
  const listings = await Listing.find(filter).sort(sort).limit(100);
  res.json({ listings });
}

export async function createListing(req, res, next) {
  try {
    if (req.body.status === "active") await ensureLimit(req.user.business);
    const imageFiles = Array.isArray(req.files) ? req.files : req.files?.images || [];
    const videoFile = Array.isArray(req.files) ? null : req.files?.video?.[0];
    const uploads = await Promise.all(imageFiles.map((file) => uploadImage(file, "listingjet/listings")));
    const video = videoFile ? await uploadVideo(videoFile, "listingjet/listings/videos") : null;
    const slug = await uniqueSlug(req.body.slug || req.body.title);
    const listing = await Listing.create({
      ...req.body,
      videoUrl: video?.url || req.body.videoUrl,
      slug,
      business: req.user.business,
      createdBy: req.user._id,
      images: uploads.filter(Boolean)
    });
    res.status(201).json({ listing });
  } catch (error) {
    next(error);
  }
}

export async function getListing(req, res, next) {
  const listing = await Listing.findOne({ _id: req.params.id, business: req.user.business });
  if (!listing) return next(new HttpError(404, "Listing not found"));
  res.json({ listing });
}

export async function updateListing(req, res, next) {
  try {
    if (req.body.status === "active") await ensureLimit(req.user.business);
    const imageFiles = Array.isArray(req.files) ? req.files : req.files?.images || [];
    const videoFile = Array.isArray(req.files) ? null : req.files?.video?.[0];
    const uploads = await Promise.all(imageFiles.map((file) => uploadImage(file, "listingjet/listings")));
    const video = videoFile ? await uploadVideo(videoFile, "listingjet/listings/videos") : null;
    const set = { ...req.body };
    if (video?.url) set.videoUrl = video.url;
    const update = uploads.length ? { $set: set, $push: { images: { $each: uploads } } } : set;
    const listing = await Listing.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, update, { new: true });
    if (!listing) throw new HttpError(404, "Listing not found");
    res.json({ listing });
  } catch (error) {
    next(error);
  }
}

export async function deleteListing(req, res) {
  await Listing.deleteOne({ _id: req.params.id, business: req.user.business });
  res.json({ message: "Listing deleted" });
}

export async function setStatus(req, res, next) {
  try {
    const nextStatus = req.params.action === "publish" ? "active" : req.params.action === "pause" ? "paused" : "archived";
    if (nextStatus === "active") await ensureLimit(req.user.business);
    const listing = await Listing.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, { status: nextStatus }, { new: true });
    if (!listing) throw new HttpError(404, "Listing not found");
    res.json({ listing });
  } catch (error) {
    next(error);
  }
}

export async function duplicateListing(req, res, next) {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, business: req.user.business }).lean();
    if (!listing) throw new HttpError(404, "Listing not found");
    delete listing._id;
    listing.title = `${listing.title} Copy`;
    listing.slug = await uniqueSlug(listing.title);
    listing.status = "draft";
    const copy = await Listing.create(listing);
    res.status(201).json({ listing: copy });
  } catch (error) {
    next(error);
  }
}

export async function marketingAssets(req, res, next) {
  const listing = await Listing.findOne({ _id: req.params.id, business: req.user.business });
  if (!listing) return next(new HttpError(404, "Listing not found"));
  const business = await Business.findById(req.user.business);
  res.json({ assets: generateMarketingAssets(listing, business) });
}

async function uniqueSlug(input) {
  const base = slugify(input, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (await Listing.exists({ slug })) {
    slug = `${base}-${count++}`;
  }
  return slug;
}
