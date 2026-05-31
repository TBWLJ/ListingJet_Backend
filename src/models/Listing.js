import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: String,
    listingType: {
      type: String,
      enum: ["property", "hotel_room", "event_center", "vehicle", "job", "product", "service"],
      required: true
    },
    price: Number,
    currency: { type: String, default: "NGN" },
    location: String,
    description: String,
    features: [{ type: String }],
    amenities: [{ type: String }],
    images: [{ url: String, publicId: String }],
    videoUrl: String,
    contactPerson: String,
    contactPhone: String,
    whatsapp: String,
    status: { type: String, enum: ["draft", "active", "paused", "archived"], default: "draft", index: true },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    seoTitle: String,
    seoDescription: String,
    stats: {
      views: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
      whatsappClicks: { type: Number, default: 0 },
      callClicks: { type: Number, default: 0 },
      leadSubmissions: { type: Number, default: 0 },
      shareClicks: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

listingSchema.index({ title: "text", description: "text", location: "text", category: "text" });

export default mongoose.model("Listing", listingSchema);
