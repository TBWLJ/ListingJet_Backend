import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import { initializePaystack, verifyPaystack } from "../services/paystack.service.js";
import { getPlan, periodEnd, PLANS } from "../services/subscription.service.js";
import { HttpError } from "../utils/httpError.js";

export function plans(_req, res) {
  res.json({ plans: PLANS });
}

export async function current(req, res) {
  const subscription = await Subscription.findOne({ business: req.user.business });
  res.json({ subscription });
}

export async function subscribe(req, res, next) {
  try {
    const selected = getPlan(req.body.plan, req.body.billingCycle || "monthly");
    if (!selected) throw new HttpError(400, "Invalid plan");
    const reference = `LJ-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const payment = await Payment.create({
      business: req.user.business,
      reference,
      amount: selected.amount,
      plan: selected.plan,
      billingCycle: selected.billingCycle
    });
    const init = await initializePaystack({
      email: req.user.email,
      amount: selected.amount,
      reference,
      metadata: { business: req.user.business.toString(), plan: selected.plan, billingCycle: selected.billingCycle }
    });
    res.status(201).json({ payment, authorizationUrl: init.authorization_url, accessCode: init.access_code, reference });
  } catch (error) {
    next(error);
  }
}

export async function verify(req, res, next) {
  try {
    const { reference } = req.body;
    const payment = await Payment.findOne({ reference, business: req.user.business });
    if (!payment) throw new HttpError(404, "Payment not found");
    const result = await verifyPaystack(reference);
    if (result.status !== "success") throw new HttpError(400, "Payment not successful");
    const selected = getPlan(payment.plan, payment.billingCycle);
    const subscription = await Subscription.findOneAndUpdate(
      { business: req.user.business },
      {
        plan: payment.plan,
        billingCycle: payment.billingCycle,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd(payment.billingCycle),
        limits: selected.limits
      },
      { new: true, upsert: true }
    );
    payment.status = "success";
    payment.paidAt = new Date();
    payment.subscription = subscription._id;
    payment.providerResponse = result;
    await payment.save();
    res.json({ payment, subscription });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req, res) {
  const subscription = await Subscription.findOneAndUpdate(
    { business: req.user.business },
    { status: "cancelled", cancelledAt: new Date() },
    { new: true }
  );
  res.json({ subscription });
}
