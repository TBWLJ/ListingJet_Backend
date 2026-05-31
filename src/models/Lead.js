import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    name: { type: String, required: true },
    phone: String,
    email: String,
    message: String,
    preferredContactMethod: { type: String, enum: ["phone", "whatsapp", "email"], default: "whatsapp" },
    budget: String,
    locationPreference: String,
    source: { type: String, default: "campaign_page" },
    status: { type: String, enum: ["new", "contacted", "qualified", "converted", "lost"], default: "new", index: true },
    notes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        body: String,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    timeline: [
      {
        event: String,
        metadata: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
