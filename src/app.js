import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import businessRoutes from "./routes/business.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import teamRoutes from "./routes/team.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import publicRoutes from "./routes/public.routes.js";
import locationRoutes from "./routes/location.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true }));
app.use("/api/v1/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => res.json({ ok: true, app: "ListingJet" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/business", businessRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/team", teamRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/public", publicRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
