import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Authentication required");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select("+password");
    if (!user || !user.isActive) throw new HttpError(401, "Invalid session");
    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : new HttpError(401, "Authentication required"));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Insufficient permissions"));
    next();
  };
}

export function requirePermission(permission) {
  return (req, _res, next) => {
    if (req.user.role === "super_admin" || req.user.role === "business_owner") return next();
    if (!req.user.permissions?.includes(permission)) return next(new HttpError(403, "Permission denied"));
    next();
  };
}
