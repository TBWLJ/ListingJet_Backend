import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
    plan: { type: String, enum: ["starter", "growth", "premium", "enterprise"], default: "starter" },
    billingCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    status: { type: String, enum: ["trialing", "active", "past_due", "cancelled", "expired"], default: "trialing" },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    providerCustomerId: String,
    providerSubscriptionId: String,
    limits: {
      activeListings: { type: Number, default: 20 },
      teamMembers: { type: Number, default: 1 },
      apiAccess: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false }
    },
    cancelledAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
