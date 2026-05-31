import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true, unique: true },
    plan: { type: String, enum: ["starter", "professional", "enterprise"], default: "starter" },
    billingCycle: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    status: { type: String, enum: ["trialing", "active", "past_due", "cancelled", "expired"], default: "trialing" },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    paystackCustomerCode: String,
    paystackSubscriptionCode: String,
    limits: {
      activeListings: { type: Number, default: 50 },
      teamMembers: { type: Number, default: 1 },
      apiAccess: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false }
    },
    cancelledAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
