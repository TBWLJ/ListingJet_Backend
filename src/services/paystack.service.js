import axios from "axios";

const client = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
});

export async function initializePaystack({ email, amount, reference, metadata }) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return {
      authorization_url: `${process.env.PAYSTACK_CALLBACK_URL || "http://localhost:3000/billing"}?reference=${reference}`,
      access_code: "dev_access_code",
      reference
    };
  }
  const { data } = await client.post("/transaction/initialize", {
    email,
    amount: amount * 100,
    reference,
    callback_url: process.env.PAYSTACK_CALLBACK_URL,
    metadata
  });
  return data.data;
}

export async function verifyPaystack(reference) {
  if (!process.env.PAYSTACK_SECRET_KEY) return { status: "success", reference, amount: 0 };
  const { data } = await client.get(`/transaction/verify/${reference}`);
  return data.data;
}
