import Payment from "../models/Payment.js";
import { normalizeWebhookPayload, verifyWebhookSignature } from "../services/payment.service.js";
import { activatePayment } from "./subscription.controller.js";

export async function history(req, res) {
  const payments = await Payment.find({ business: req.user.business }).sort("-createdAt");
  res.json({ payments });
}

export async function webhook(req, res, next) {
  try {
    if (!verifyWebhookSignature(req)) return res.sendStatus(401);

    const event = normalizeWebhookPayload(req.body);
    if (!event.reference) return res.status(400).json({ message: "Webhook reference missing" });

    const payment = await Payment.findOne({ reference: event.reference });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (event.status === "success") {
      await activatePayment(payment, event.raw);
    } else if (event.status === "failed") {
      payment.status = "failed";
      payment.providerResponse = event.raw;
      await payment.save();
    } else {
      payment.providerResponse = event.raw;
      await payment.save();
    }

    res.json({ message: "Webhook processed" });
  } catch (error) {
    next(error);
  }
}
