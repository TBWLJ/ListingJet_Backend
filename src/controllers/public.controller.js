import crypto from "crypto";
import Listing from "../models/Listing.js";
import Business from "../models/Business.js";
import Lead from "../models/Lead.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { leadEmail, sendEmail } from "../services/email.service.js";

export async function campaign(req, res, next) {
  const listing = await Listing.findOne({ slug: req.params.slug, status: "active", visibility: "public" });
  if (!listing) return next(new HttpError(404, "Campaign page not found"));
  const business = await Business.findById(listing.business);
  const similar = await Listing.find({ business: listing.business, status: "active", _id: { $ne: listing._id } }).limit(3);
  await track(listing, "page_view", req);
  await Listing.updateOne({ _id: listing._id }, { $inc: { "stats.views": 1 } });
  res.json({ listing, business, similar });
}

export async function submitLead(req, res, next) {
  try {
    const listing = await Listing.findOne({ slug: req.params.slug, status: "active" });
    if (!listing) throw new HttpError(404, "Listing not found");
    const lead = await Lead.create({
      ...req.body,
      business: listing.business,
      listing: listing._id,
      timeline: [{ event: "lead_submitted" }]
    });
    await Promise.all([
      Listing.updateOne({ _id: listing._id }, { $inc: { "stats.leadSubmissions": 1 } }),
      track(listing, "lead_submission", req),
      Notification.create({ business: listing.business, type: "new_lead", title: "New lead captured", body: `${lead.name} inquired about ${listing.title}`, link: `/leads/${lead._id}` })
    ]);
    const owners = await User.find({ business: listing.business, role: { $in: ["business_owner", "team_member"] } });
    await Promise.all(owners.map((user) => sendEmail({ to: user.email, ...leadEmail(lead, listing) })));
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
}

export async function event(req, res, next) {
  const listing = await Listing.findOne({ slug: req.params.slug, status: "active" });
  if (!listing) return next(new HttpError(404, "Listing not found"));
  const typeMap = {
    whatsapp: "whatsapp_click",
    call: "call_click",
    share: "share_click",
    view: "page_view"
  };
  const type = typeMap[req.body.action] || req.body.type || "page_view";
  const inc = {
    whatsapp_click: "stats.whatsappClicks",
    call_click: "stats.callClicks",
    share_click: "stats.shareClicks",
    page_view: "stats.views"
  }[type];
  if (inc) await Listing.updateOne({ _id: listing._id }, { $inc: { [inc]: 1 } });
  await track(listing, type, req, req.body);
  res.json({ ok: true });
}

export async function report(req, res, next) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new HttpError(404, "Report not found"));
  const business = await Business.findById(listing.business);
  const leads = await Lead.find({ listing: listing._id }).sort("-createdAt").limit(25);
  res.json({ listing, business, leads, summary: listing.stats });
}

async function track(listing, type, req, metadata = {}) {
  const ipHash = crypto.createHash("sha256").update(req.ip || "").digest("hex");
  return AnalyticsEvent.create({
    business: listing.business,
    listing: listing._id,
    type,
    source: metadata.source,
    channel: metadata.channel,
    visitorId: req.headers["x-visitor-id"],
    ipHash,
    userAgent: req.headers["user-agent"],
    metadata
  });
}
