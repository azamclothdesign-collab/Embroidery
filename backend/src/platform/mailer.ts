import nodemailer, { type Transporter } from "nodemailer";
import { config } from "./config.ts";
import { decryptSecret } from "./crypto.ts";
import { getSetting } from "./settingsStore.ts";

export type Mail = { to: string; subject: string; text: string; html: string };

type Transport = { transporter: Transporter; from: string };

async function resolveTransport(): Promise<Transport | null> {
  const smtp = await getSetting("smtp");
  const host = smtp.host || config.SMTP_HOST;
  if (host.length === 0) return null;

  const usingAdmin = smtp.host.length > 0;
  const user = usingAdmin ? smtp.user : config.SMTP_USER;
  const pass = usingAdmin ? decryptSecret(smtp.passEnc) : config.SMTP_PASS;
  const port = usingAdmin ? smtp.port : config.SMTP_PORT;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: usingAdmin ? smtp.secure : port === 465,
    ...(user.length > 0 ? { auth: { user, pass } } : {}),
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  const from = (usingAdmin ? smtp.from : config.SMTP_FROM) || user;
  return { transporter, from };
}

/**
 * Sends one email. Returns false (and logs) when SMTP is not configured or
 * the server rejects it — callers decide whether that matters.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  try {
    const transport = await resolveTransport();
    if (transport === null) {
      console.warn(JSON.stringify({ level: "warn", msg: "smtp not configured; email skipped", subject: mail.subject }));
      return false;
    }
    await transport.transporter.sendMail({ from: transport.from, ...mail });
    return true;
  } catch (error) {
    console.error(
      JSON.stringify({ level: "error", msg: "email send failed", subject: mail.subject, error: (error as Error).message }),
    );
    return false;
  }
}

export async function verifySmtp(): Promise<{ ok: boolean; message: string }> {
  try {
    const transport = await resolveTransport();
    if (transport === null) return { ok: false, message: "SMTP host is empty" };
    await transport.transporter.verify();
    return { ok: true, message: "Connected to the mail server" };
  } catch (error) {
    return { ok: false, message: (error as Error).message.slice(0, 300) };
  }
}

/** Minimal, inline-styled email layout. */
export function emailLayout(storeName: string, bodyHtml: string, dir: "ltr" | "rtl" = "ltr"): string {
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#FAF7F2;font-family:Segoe UI,Arial,sans-serif;color:#17171C">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;padding:32px">
<tr><td style="font-size:20px;font-weight:600;padding-bottom:16px;border-bottom:2px dashed #E85D2A">${storeName}</td></tr>
<tr><td style="padding-top:20px;font-size:15px;line-height:1.6">${bodyHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#E85D2A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${label}</a></p>`;
}
