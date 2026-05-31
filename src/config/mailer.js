import nodemailer from "nodemailer";

export function createMailer() {
  const brevoLogin = process.env.BREVO_SMTP_LOGIN || process.env.BREVO_SMTP_USER;
  const brevoKey = process.env.BREVO_SMTP_KEY || process.env.BREVO_API_KEY;
  const host = process.env.SMTP_HOST || (brevoLogin && brevoKey ? "smtp-relay.brevo.com" : "");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || brevoLogin;
  const pass = process.env.SMTP_PASS || brevoKey;

  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}
