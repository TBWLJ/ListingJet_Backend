import axios from "axios";

const apiKey = process.env.FINSWITZ_API_KEY;

const finswitz = axios.create({
  baseURL: process.env.FINSWITZ_BASE_URL || "https://api.finswitz.com",
  headers: {
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    "Content-Type": "application/json"
  }
});

export default finswitz;
