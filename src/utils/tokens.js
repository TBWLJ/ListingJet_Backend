import jwt from "jsonwebtoken";
import crypto from "crypto";

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, business: user.business?.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
