import User from "../models/User.js";
import TeamInvite from "../models/TeamInvite.js";
import { randomToken, hashToken } from "../utils/tokens.js";
import { sendEmail, teamInviteEmail } from "../services/email.service.js";

export async function team(req, res) {
  const [members, invites] = await Promise.all([
    User.find({ business: req.user.business, role: { $in: ["business_owner", "team_member"] } }),
    TeamInvite.find({ business: req.user.business, status: "pending" })
  ]);
  res.json({ members, invites });
}

export async function invite(req, res) {
  const token = randomToken();
  const inviteDoc = await TeamInvite.create({
    business: req.user.business,
    email: req.body.email,
    role: req.body.role || "viewer",
    permissions: req.body.permissions || [],
    token: hashToken(token),
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  const link = `${process.env.FRONTEND_URL}/register?invite=${token}`;
  await sendEmail({ to: req.body.email, ...teamInviteEmail(link) });
  res.status(201).json({ invite: inviteDoc });
}

export async function updateMember(req, res) {
  const member = await User.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, req.body, { new: true });
  res.json({ member });
}

export async function removeMember(req, res) {
  await User.updateOne({ _id: req.params.id, business: req.user.business, role: "team_member" }, { isActive: false });
  res.json({ message: "Team member removed" });
}
