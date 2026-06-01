import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const APP_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BRAND = {
  navy: "#071527",
  ink: "#102033",
  muted: "#64748b",
  border: "#e2e8f0",
  background: "#f6f8fb",
  gold: "#d7a84b",
  mint: "#2fbf8f",
  white: "#ffffff"
};

export async function sendEmail({ to, subject, html, text }) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.log("Email skipped: BREVO_API_KEY is not configured", { to, subject });
      return null;
    }

    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@listingjet.com";
    const senderName = process.env.BREVO_SENDER_NAME || "ListingJet";
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    return response.data;
  } catch (err) {
    console.error("Error sending email:", err.response?.data || err.message);
    return null;
  }
}

export function verificationEmail(name, link) {
  return {
    subject: "Verify your ListingJet account",
    html: renderEmail({
      eyebrow: "Email verification",
      title: "Verify your ListingJet account",
      intro: `Hello ${escapeHtml(name)}, verify your email to continue to subscription and activate your workspace.`,
      buttonLabel: "Verify email",
      buttonUrl: link,
      note: "This verification link expires in 24 hours. If you did not create a ListingJet account, you can safely ignore this email."
    }),
    text: `Hello ${name}, verify your account to continue to subscription: ${link}`
  };
}

export function signupNotificationEmail({ businessName, ownerName, email, phone, industry, country, city }) {
  const rows = [
    ["Business", businessName],
    ["Owner", ownerName],
    ["Email", email],
    ["Phone", phone],
    ["Industry", industry],
    ["Location", `${city}, ${country}`]
  ];

  return {
    subject: `New ListingJet signup: ${businessName}`,
    html: renderEmail({
      eyebrow: "Admin notification",
      title: "New business signup",
      intro: "A new business just registered on ListingJet. Their verification email has been sent.",
      body: detailsTable(rows),
      note: "This is an internal notification. No user verification link is included."
    }),
    text: `New ListingJet signup: ${businessName}. Owner: ${ownerName}. Email: ${email}. Phone: ${phone}. Industry: ${industry}. Location: ${city}, ${country}.`
  };
}

export function leadEmail(lead, listing) {
  const rows = [
    ["Lead name", lead.name],
    ["Listing", listing.title],
    ["Phone", lead.phone || "N/A"],
    ["Email", lead.email || "N/A"],
    ["Preferred contact", lead.preferredContactMethod || "N/A"],
    ["Budget", lead.budget || "N/A"],
    ["Location preference", lead.locationPreference || "N/A"]
  ];

  return {
    subject: `New lead for ${listing.title}`,
    html: renderEmail({
      eyebrow: "New lead captured",
      title: `New inquiry for ${listing.title}`,
      intro: `${escapeHtml(lead.name)} submitted an inquiry from a ListingJet campaign page.`,
      body: `${detailsTable(rows)}${messageBox("Message", lead.message || "No message provided.")}`,
      buttonLabel: "Open leads dashboard",
      buttonUrl: `${APP_URL}/leads`,
      note: "Respond quickly while the lead intent is fresh."
    }),
    text: `${lead.name} submitted an inquiry for ${listing.title}. Phone: ${lead.phone || "N/A"} Email: ${lead.email || "N/A"}`
  };
}

export function resetPasswordEmail(link) {
  return {
    subject: "Reset your ListingJet password",
    html: renderEmail({
      eyebrow: "Password reset",
      title: "Reset your password",
      intro: "We received a request to reset your ListingJet password. Use the button below to choose a new password.",
      buttonLabel: "Reset password",
      buttonUrl: link,
      note: "This link expires in 1 hour. If you did not request this, you can ignore this email."
    }),
    text: `Reset your ListingJet password: ${link}`
  };
}

export function teamInviteEmail(link) {
  return {
    subject: "Join a ListingJet workspace",
    html: renderEmail({
      eyebrow: "Workspace invite",
      title: "You have been invited to ListingJet",
      intro: "A ListingJet workspace owner invited you to join their team. Accept the invite to collaborate on listings, leads, and marketing campaigns.",
      buttonLabel: "Accept invite",
      buttonUrl: link,
      note: "This invite expires in 7 days."
    }),
    text: `Accept your ListingJet workspace invite: ${link}`
  };
}

function renderEmail({ eyebrow, title, intro, body = "", buttonLabel, buttonUrl, note }) {
  const button = buttonLabel && buttonUrl ? ctaButton(buttonLabel, buttonUrl) : "";
  const safeIntro = intro ? `<p style="margin:0;color:${BRAND.muted};font-size:16px;line-height:26px;">${intro}</p>` : "";
  const safeNote = note ? `<p style="margin:24px 0 0;color:${BRAND.muted};font-size:13px;line-height:21px;">${escapeHtml(note)}</p>` : "";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BRAND.background};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:${BRAND.white};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND.navy};padding:28px 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;background:${BRAND.white};color:${BRAND.navy};font-weight:800;font-size:14px;line-height:32px;width:32px;height:32px;text-align:center;border-radius:7px;">LJ</div>
                      <span style="color:${BRAND.white};font-size:20px;font-weight:800;margin-left:10px;vertical-align:middle;">ListingJet</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:18px;color:${BRAND.gold};font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(eyebrow)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 14px;color:${BRAND.navy};font-size:28px;line-height:36px;font-weight:800;">${escapeHtml(title)}</h1>
                ${safeIntro}
                ${body}
                ${button}
                ${safeNote}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#f8fafc;border-top:1px solid ${BRAND.border};">
                <p style="margin:0;color:${BRAND.muted};font-size:12px;line-height:20px;">Upload Once. Market Everywhere. Track Every Lead.</p>
                <p style="margin:8px 0 0;color:${BRAND.muted};font-size:12px;line-height:20px;">ListingJet helps businesses create campaign pages, capture leads, and prove performance.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ctaButton(label, url) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
      <tr>
        <td style="border-radius:8px;background:${BRAND.mint};">
          <a href="${escapeAttribute(url)}" style="display:inline-block;padding:13px 20px;color:${BRAND.navy};font-size:14px;font-weight:800;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

function detailsTable(rows) {
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid ${BRAND.border};color:${BRAND.muted};font-size:13px;width:38%;">${escapeHtml(label)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${BRAND.border};color:${BRAND.ink};font-size:13px;font-weight:700;">${escapeHtml(value || "N/A")}</td>
    </tr>`).join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;border:1px solid ${BRAND.border};border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">
      ${rowHtml}
    </table>`;
}

function messageBox(label, value) {
  return `
    <div style="margin-top:18px;padding:16px;border-radius:8px;background:#f8fafc;border:1px solid ${BRAND.border};">
      <p style="margin:0 0 8px;color:${BRAND.navy};font-size:13px;font-weight:800;">${escapeHtml(label)}</p>
      <p style="margin:0;color:${BRAND.muted};font-size:14px;line-height:22px;">${escapeHtml(value)}</p>
    </div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
