import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", index: true },
    type: {
      type: String,
      enum: ["page_view", "unique_visit", "whatsapp_click", "call_click", "lead_submission", "share_click"],
      required: true
    },
    source: String,
    channel: String,
    visitorId: String,
    ipHash: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
