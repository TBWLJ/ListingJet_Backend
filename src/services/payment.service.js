import crypto from "crypto";
import finswitz from "../config/finswitz.js";

const providerName = "finswitz";

function callbackUrl(reference) {
  const base = process.env.PAYMENT_CALLBACK_URL || `${process.env.FRONTEND_URL || "http://localhost:3000"}/billing`;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}reference=${encodeURIComponent(reference)}`;
}

function paymentLinkPayload({ email, amount, currency, reference, metadata }) {
  return {
    amount,
    currency,
    reference,
    title: metadata?.title || "ListingJet subscription",
    email,
    callback_url: callbackUrl(reference),
    metadata
  };
}

function pickCheckoutUrl(data) {
  return data?.checkoutUrl || data?.checkout_url || data?.paymentUrl || data?.payment_url || data?.authorizationUrl || data?.authorization_url || data?.url;
}

function pickReference(data, fallback) {
  return data?.reference || data?.paymentReference || data?.payment_reference || data?.data?.reference || fallback;
}

export async function initializeSubscriptionPayment({ email, amount, currency = "NGN", reference, metadata }) {
  if (!process.env.FINSWITZ_API_KEY) {
    return {
      provider: providerName,
      authorizationUrl: callbackUrl(reference),
      reference,
      raw: { mode: "development", status: "success" }
    };
  }

  const path = process.env.FINSWITZ_PAYMENT_LINK_PATH || "/payments/payment-links";
  const { data } = await finswitz.post(path, paymentLinkPayload({ email, amount, currency, reference, metadata }));
  const payload = data?.data || data;
  const authorizationUrl = pickCheckoutUrl(payload);

  if (!authorizationUrl) {
    const error = new Error("Finswitz did not return a checkout URL");
    error.status = 502;
    error.details = data;
    throw error;
  }

  return {
    provider: providerName,
    authorizationUrl,
    reference: pickReference(payload, reference),
    raw: data
  };
}

function normalizePaymentStatus(value) {
  const status = String(value || "").toLowerCase();
  if (["success", "successful", "paid", "completed", "payment.success"].includes(status)) return "success";
  if (["failed", "failure", "cancelled", "canceled", "payment.failed"].includes(status)) return "failed";
  return "pending";
}

export async function verifySubscriptionPayment(reference) {
  if (!process.env.FINSWITZ_API_KEY) {
    return {
      provider: providerName,
      status: "success",
      reference,
      raw: { mode: "development", status: "success" }
    };
  }

  const template = process.env.FINSWITZ_VERIFY_PATH || "/payments/transactions/:reference";
  const path = template.replace(":reference", encodeURIComponent(reference));
  const { data } = await finswitz.get(path);
  const payload = data?.data || data;

  return {
    provider: providerName,
    status: normalizePaymentStatus(payload?.status || payload?.event),
    reference: pickReference(payload, reference),
    raw: data
  };
}

export function normalizeWebhookPayload(body) {
  const payload = Buffer.isBuffer(body) ? JSON.parse(body.toString("utf8")) : body;
  const data = payload?.data || payload;
  return {
    event: payload?.event || payload?.type || data?.status,
    status: normalizePaymentStatus(payload?.event || payload?.type || data?.status),
    reference: data?.reference || data?.paymentReference || data?.payment_reference || payload?.reference,
    raw: payload
  };
}

export function verifyWebhookSignature(req) {
  const secret = process.env.FINSWITZ_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = req.headers["x-finswitz-signature"] || req.headers["x-payment-signature"] || req.headers["x-signature"];
  if (!signature) return false;

  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const normalizedSignature = String(signature).replace(/^sha256=/, "");
  if (digest.length !== normalizedSignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(normalizedSignature));
}
