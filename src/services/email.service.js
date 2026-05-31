import { createMailer } from "../config/mailer.js";

export async function sendEmail({ to, subject, html, text }) {
  const transporter = createMailer();
  const from = process.env.EMAIL_FROM || "ListingJet <hello@listingjet.local>";
  if (!transporter) {
    console.log("Email skipped:", { to, subject, text });
    return;
  }
  await transporter.sendMail({ from, to, subject, html, text });
}

export function verificationEmail(name, link) {
  return {
    subject: "Verify your ListingJet account",
    html: `<p>Hello ${name},</p><p>Verify your account to continue to subscription and activate your ListingJet workspace.</p><p><a href="${link}">Verify email</a></p>`,
    text: `Hello ${name}, verify your account to continue to subscription: ${link}`
  };
}

export function leadEmail(lead, listing) {
  return {
    subject: `New lead for ${listing.title}`,
    html: `<p>${lead.name} submitted an inquiry for <strong>${listing.title}</strong>.</p><p>${lead.message || ""}</p><p>Phone: ${lead.phone || "N/A"}<br>Email: ${lead.email || "N/A"}</p>`,
    text: `${lead.name} submitted an inquiry for ${listing.title}. Phone: ${lead.phone || "N/A"} Email: ${lead.email || "N/A"}`
  };
}
