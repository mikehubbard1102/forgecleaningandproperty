import { Resend } from "resend";

/**
 * POST /api/contact
 * Sends a "Request a Quote" submission to Mike via Resend.
 *
 * Required env var (set in Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY   — from https://resend.com/api-keys
 * Optional env vars:
 *   TO_EMAIL         — where quote requests are delivered (default: mike@forgecleaningandpropertyservices.com)
 *   FROM_EMAIL       — verified sender (default: onboarding@resend.dev, which works out of the box
 *                      as long as TO_EMAIL is the same address you signed up to Resend with).
 *                      Once the domain is verified in Resend, set this to e.g. quotes@forgecleaningandpropertyservices.com
 */

const TO_EMAIL = process.env.TO_EMAIL || "mike@forgecleaningandpropertyservices.com";
const FROM_EMAIL = process.env.FROM_EMAIL || "Forge Website <onboarding@resend.dev>";

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Body may arrive parsed (object) or raw (string) depending on runtime.
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const name = (body.name || "").toString().trim();
  const phone = (body.phone || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const service = (body.service || "").toString().trim();
  const message = (body.message || "").toString().trim();
  const honeypot = (body.company || "").toString().trim();

  // Bot caught by honeypot — pretend success, send nothing.
  if (honeypot) return res.status(200).json({ ok: true });

  // Validate
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || !phone || !emailRe.test(email)) {
    return res.status(400).json({ error: "Please include your name, phone, and a valid email." });
  }
  if (name.length > 120 || message.length > 4000) {
    return res.status(400).json({ error: "That submission looks too long." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ error: "Email isn't configured yet. Please call (904) 469-7439." });
  }

  const resend = new Resend(apiKey);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#111927">
      <h2 style="color:#0F2A4A;margin:0 0 4px">New quote request</h2>
      <p style="color:#556072;margin:0 0 20px">From the Forge Cleaning &amp; Property Services website</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">
        <tr><td style="padding:8px 0;color:#556072;width:130px">Name</td><td style="padding:8px 0"><strong>${esc(name)}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#556072">Phone</td><td style="padding:8px 0"><a href="tel:${esc(phone)}">${esc(phone)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#556072">Email</td><td style="padding:8px 0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#556072">Service</td><td style="padding:8px 0">${esc(service) || "&mdash;"}</td></tr>
      </table>
      <div style="margin-top:18px;padding:16px;background:#F4F1EC;border-radius:10px;border:1px solid #DDE3EC">
        <div style="color:#556072;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Message</div>
        <div style="white-space:pre-wrap;font-size:15px">${esc(message) || "(none)"}</div>
      </div>
      <p style="margin-top:20px;font-size:13px;color:#556072">Reply directly to this email to respond to ${esc(name)}.</p>
    </div>`;

  const text =
    `New quote request — Forge Cleaning & Property Services\n\n` +
    `Name:    ${name}\n` +
    `Phone:   ${phone}\n` +
    `Email:   ${email}\n` +
    `Service: ${service || "—"}\n\n` +
    `Message:\n${message || "(none)"}\n`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New quote request from ${name}${service ? " — " + service : ""}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(502).json({ error: "We couldn't send your request just now. Please call (904) 469-7439." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected error sending email:", err);
    return res.status(500).json({ error: "Something went wrong. Please call (904) 469-7439." });
  }
}
