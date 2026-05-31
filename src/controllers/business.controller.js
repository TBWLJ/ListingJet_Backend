import Business from "../models/Business.js";

export async function getBusiness(req, res) {
  const business = await Business.findById(req.user.business);
  res.json({ business });
}

export async function updateBusiness(req, res) {
  const business = await Business.findByIdAndUpdate(req.user.business, req.body, { new: true, runValidators: true });
  res.json({ business });
}
