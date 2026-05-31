import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: "Business", required: true },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" },
    reference: { type: String, required: true, unique: true },
    amount: Number,
    currency: { type: String, default: "NGN" },
    plan: String,
    billingCycle: String,
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    provider: { type: String, default: "paystack" },
    providerResponse: mongoose.Schema.Types.Mixed,
    paidAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
