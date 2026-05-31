import User from "../models/User.js";
import Business from "../models/Business.js";
import Subscription from "../models/Subscription.js";
import { HttpError } from "../utils/httpError.js";
import { hashToken, randomToken, signAccessToken } from "../utils/tokens.js";
import { sendEmail, verificationEmail } from "../services/email.service.js";
import { PLANS, periodEnd } from "../services/subscription.service.js";

export async function register(req, res, next) {
  try {
    const { businessName, ownerName, email, phone, password, industry, country, city } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new HttpError(409, "Email already registered");

    const verificationToken = randomToken();
    const user = await User.create({
      name: ownerName,
      email,
      phone,
      password,
      role: "business_owner",
      verificationToken: hashToken(verificationToken),
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    const business = await Business.create({
      name: businessName,
      owner: user._id,
      industry,
      country,
      city,
      contactEmail: email,
      phone
    });
    user.business = business._id;
    await user.save();
    await Subscription.create({
      business: business._id,
      plan: "starter",
      billingCycle: "monthly",
      status: "trialing",
      currentPeriodStart: new Date(),
      currentPeriodEnd: periodEnd("monthly"),
      limits: PLANS.starter.limits
    });

    const link = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({ to: email, ...verificationEmail(ownerName, link) });
    res.status(201).json({ user: publicUser(user), token: signAccessToken(user), business });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password))) throw new HttpError(401, "Invalid email or password");
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ user: publicUser(user), token: signAccessToken(user) });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const user = await User.findOne({
      verificationToken: hashToken(req.params.token),
      verificationTokenExpires: { $gt: new Date() }
    });
    if (!user) throw new HttpError(400, "Invalid or expired verification token");
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: "Email verified" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = randomToken();
      user.resetPasswordToken = hashToken(token);
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendEmail({ to: user.email, subject: "Reset your ListingJet password", text: link, html: `<a href="${link}">Reset password</a>` });
    }
    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const user = await User.findOne({
      resetPasswordToken: hashToken(req.body.token),
      resetPasswordExpires: { $gt: new Date() }
    }).select("+password");
    if (!user) throw new HttpError(400, "Invalid or expired reset token");
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  const business = await Business.findById(req.user.business);
  res.json({ user: publicUser(req.user), business });
}

function publicUser(user) {
  return {
    id: user._id,
    business: user.business,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    teamRole: user.teamRole,
    permissions: user.permissions,
    isEmailVerified: user.isEmailVerified
  };
}
