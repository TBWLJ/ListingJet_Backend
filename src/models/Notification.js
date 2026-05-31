import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["new_lead", "subscription", "listing_performance", "team", "system"],
      default: "system"
    },
    title: String,
    body: String,
    link: String,
    readAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
