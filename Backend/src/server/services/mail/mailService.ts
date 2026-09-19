import nodemailer from "nodemailer";

import { businessContact } from "../../../constants/businessContact.js";
import { type ContactMessageInput } from "../../../types/contact.js";

const topicLabels: Record<string, string> = {
  "file-format": "File Format",
  "machine-compatibility": "Machine Compatibility",
  "download-issue": "Download Issue",
  "order-question": "Order Question",
  "payment-question": "Payment Question",
  "embroidery-guide": "Embroidery Guide",
  licensing: "Licensing",
  "technical-issue": "Technical Issue",
  other: "Other",
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
}

function contactInbox(): string {
  return readEnv("CONTACT_INBOX") ?? businessContact.email;
}

function smtpConfigured(): boolean {
  return (
    readEnv("SMTP_HOST") !== undefined &&
    readEnv("SMTP_USER") !== undefined &&
    readEnv("SMTP_PASS") !== undefined
  );
}

function createTransport() {
  const host = readEnv("SMTP_HOST");
  const user = readEnv("SMTP_USER");
  const pass = readEnv("SMTP_PASS");

  if (host === undefined || user === undefined || pass === undefined) {
    return null;
  }

  const port = Number(readEnv("SMTP_PORT") ?? "587");
  const secure =
    readEnv("SMTP_SECURE") === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function formatContactEmail(input: ContactMessageInput): {
  subject: string;
  text: string;
  html: string;
} {
  const topic = topicLabels[input.topic] ?? input.topic;
  const orderLine =
    input.orderNumber !== undefined && input.orderNumber.trim().length > 0
      ? input.orderNumber.trim()
      : "Not provided";

  const subject = `[Contact] ${topic} — ${input.name}`;
  const text = [
    "New contact form message",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Topic: ${topic}`,
    `Order number: ${orderLine}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;color:#1a1a1a;line-height:1.6">
      <h2 style="margin:0 0 16px;font-weight:600">New contact form message</h2>
      <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px"><strong>Topic:</strong> ${escapeHtml(topic)}</p>
      <p style="margin:0 0 16px"><strong>Order number:</strong> ${escapeHtml(orderLine)}</p>
      <p style="margin:0 0 8px"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </div>
  `.trim();

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendContactFormEmail(
  input: ContactMessageInput,
): Promise<{ sent: boolean; reason?: string }> {
  const to = contactInbox();

  if (!smtpConfigured()) {
    console.warn(
      "[mail] SMTP is not configured. Contact message saved but email was not sent.",
    );
    return { sent: false, reason: "smtp_not_configured" };
  }

  const transport = createTransport();

  if (transport === null) {
    return { sent: false, reason: "smtp_not_configured" };
  }

  const from =
    readEnv("SMTP_FROM") ??
    `"Embroidery Support" <${readEnv("SMTP_USER") ?? to}>`;
  const { subject, text, html } = formatContactEmail(input);

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: `${input.name} <${input.email}>`,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send contact email";
    console.error("[mail] Failed to send contact form email:", message);
    return { sent: false, reason: "send_failed" };
  }
}
