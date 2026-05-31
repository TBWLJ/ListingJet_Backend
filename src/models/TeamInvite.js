import mongoose from "mongoose";

const teamInviteSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ["admin", "marketer", "sales_agent", "viewer"], default: "viewer" },
    permissions: [{ type: String }],
    token: String,
    status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("TeamInvite", teamInviteSchema);
