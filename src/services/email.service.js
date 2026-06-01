import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

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
