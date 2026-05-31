import Lead from "../models/Lead.js";
import { HttpError } from "../utils/httpError.js";

export async function listLeads(req, res) {
  const filter = { business: req.user.business };
  if (req.query.status) filter.status = req.query.status;
  const leads = await Lead.find(filter).populate("listing", "title slug").sort("-createdAt").limit(100);
  res.json({ leads });
}

export async function getLead(req, res, next) {
  const lead = await Lead.findOne({ _id: req.params.id, business: req.user.business }).populate("listing");
  if (!lead) return next(new HttpError(404, "Lead not found"));
  res.json({ lead });
}

export async function updateLead(req, res, next) {
  const lead = await Lead.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, req.body, { new: true });
  if (!lead) return next(new HttpError(404, "Lead not found"));
  res.json({ lead });
}

export async function addNote(req, res, next) {
  const lead = await Lead.findOne({ _id: req.params.id, business: req.user.business });
  if (!lead) return next(new HttpError(404, "Lead not found"));
  lead.notes.push({ author: req.user._id, body: req.body.body });
  lead.timeline.push({ event: "note_added" });
  await lead.save();
  res.json({ lead });
}
