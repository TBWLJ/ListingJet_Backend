import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ business: req.user.business }).sort("-createdAt").limit(50);
  res.json({ notifications });
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, business: req.user.business },
    { readAt: new Date() },
    { new: true }
  );
  res.json({ notification });
}
