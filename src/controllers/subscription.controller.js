import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import Payment from "../models/Payment.js";
import { initializeSubscriptionPayment, verifySubscriptionPayment } from "../services/payment.service.js";
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
      currency: "NGN",
      plan: selected.plan,
      billingCycle: selected.billingCycle,
      provider: "finswitz"
    });
    const init = await initializeSubscriptionPayment({
      email: req.user.email,
      amount: selected.amount,
      currency: "NGN",
      reference,
      metadata: {
        title: `${selected.name} ${selected.billingCycle} subscription`,
        business: req.user.business.toString(),
        plan: selected.plan,
        billingCycle: selected.billingCycle,
        paymentId: payment._id.toString()
      }
    });
    payment.reference = init.reference || reference;
    payment.providerResponse = init.raw;
    await payment.save();
    res.status(201).json({ payment, authorizationUrl: init.authorizationUrl, reference: payment.reference });
  } catch (error) {
    next(error);
  }
}

export async function verify(req, res, next) {
  try {
    const { reference } = req.body;
    const payment = await Payment.findOne({ reference, business: req.user.business });
    if (!payment) throw new HttpError(404, "Payment not found");
    const result = await verifySubscriptionPayment(reference);
    if (result.status !== "success") throw new HttpError(400, "Payment not successful");
    const { subscription } = await activatePayment(payment, result);
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

export async function activatePayment(payment, providerResponse = {}) {
  const selected = getPlan(payment.plan, payment.billingCycle);
  if (!selected) throw new HttpError(400, "Invalid payment plan");

  const subscription = await Subscription.findOneAndUpdate(
    { business: payment.business },
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
  payment.paidAt = payment.paidAt || new Date();
  payment.subscription = subscription._id;
  payment.providerResponse = providerResponse;
  await payment.save();

  return { payment, subscription };
}
