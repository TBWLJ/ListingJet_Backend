import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    industry: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    logo: { url: String, publicId: String },
    brandColor: { type: String, default: "#0f766e" },
    description: String,
    contactEmail: String,
    phone: String,
    whatsapp: String,
    website: String,
    address: String,
    socials: {
      facebook: String,
      instagram: String,
      x: String,
      linkedin: String,
      telegram: String
    },
    isVerified: { type: Boolean, default: false },
    activityLog: [
      {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        action: String,
        metadata: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
