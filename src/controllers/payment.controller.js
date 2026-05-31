import crypto from "crypto";
import Payment from "../models/Payment.js";

export async function history(req, res) {
  const payments = await Payment.find({ business: req.user.business }).sort("-createdAt");
  res.json({ payments });
}

export async function webhook(req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto.createHmac("sha512", secret).update(req.body).digest("hex");
  if (secret && hash !== req.headers["x-paystack-signature"]) return res.sendStatus(401);
  res.sendStatus(200);
}
