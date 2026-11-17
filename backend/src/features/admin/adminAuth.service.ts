import { config } from "../../platform/config.ts";
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  randomToken,
  sha256Hex,
  verifyPassword,
} from "../../platform/crypto.ts";
import { isUniqueViolation, pool, withTransaction } from "../../platform/db.ts";
import { AppError, badRequest, conflict } from "../../platform/errors.ts";
import { htmlEscape } from "../../platform/http.ts";
import { emailButton, emailLayout, sendMail } from "../../platform/mailer.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import { audit } from "./audit.ts";

const SESSION_HOURS = 12;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
const RESET_MINUTES = 30;

type AdminRow = {
  id: string;
  email: string;
  password_hash: string;
  must_change_password: boolean;
  failed_attempts: number;
  locked_until: Date | null;
};

export type LoginResult = { token: string; expiresAt: string; mustChangePassword: boolean };

export async function login(email: string, password: string, ip: string, userAgent: string): Promise<LoginResult> {
  const result = await pool.query<AdminRow>(`SELECT * FROM admin_users WHERE email = $1`, [email.toLowerCase()]);
  const admin = result.rows[0];

  if (admin === undefined) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    throw new AppError(401, "invalid_credentials", "Email or password is incorrect");
  }
  if (admin.locked_until !== null && admin.locked_until > new Date()) {
    throw new AppError(423, "account_locked", "Too many failed attempts. Try again in 15 minutes or reset your password.");
  }

  if (!(await verifyPassword(password, admin.password_hash))) {
    const failed = admin.failed_attempts + 1;
    const lock = failed >= MAX_FAILED;
    await pool.query(
      `UPDATE admin_users SET failed_attempts = $2,
         locked_until = CASE WHEN $3 THEN NOW() + make_interval(mins => $4) ELSE locked_until END
       WHERE id = $1`,
      [admin.id, lock ? 0 : failed, lock, LOCK_MINUTES],
    );
    if (lock) await audit(admin.id, "admin.locked", {}, ip);
    throw new AppError(401, "invalid_credentials", "Email or password is incorrect");
  }

  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000);
  await withTransaction(async (db) => {
    await db.query(`UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = $1`, [admin.id]);
    await db.query(
      `INSERT INTO admin_sessions (token_hash, admin_id, ip, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5)`,
      [sha256Hex(token), admin.id, ip, userAgent.slice(0, 300), expiresAt],
    );
    await audit(admin.id, "admin.login", {}, ip, db);
  });
  return { token, expiresAt: expiresAt.toISOString(), mustChangePassword: admin.must_change_password };
}

export async function logout(sessionHash: string): Promise<void> {
  await pool.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [sessionHash]);
}

/** Always resolves the same way so the response never reveals whether the email exists. */
export async function requestPasswordReset(email: string, ip: string): Promise<void> {
  const result = await pool.query<{ id: string; email: string }>(`SELECT id, email FROM admin_users WHERE email = $1`, [
    email.toLowerCase(),
  ]);
  const admin = result.rows[0];
  if (admin === undefined) return;

  const token = randomToken();
  await pool.query(
    `INSERT INTO admin_password_resets (token_hash, admin_id, expires_at)
     VALUES ($1, $2, NOW() + make_interval(mins => $3))`,
    [sha256Hex(token), admin.id, RESET_MINUTES],
  );
  await audit(admin.id, "admin.reset_requested", {}, ip);

  const store = await getSetting("store");
  const link = `${config.SITE_URL}/admin/reset?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: admin.email,
    subject: `Reset your ${store.name.en} admin password`,
    text: `Use this link within ${RESET_MINUTES} minutes to set a new password:\n${link}\n\nIf you did not ask for this, ignore this email.`,
    html: emailLayout(
      htmlEscape(store.name.en),
      `<p>Use the button below within ${RESET_MINUTES} minutes to set a new admin password.</p>${emailButton(
        link,
        "Set new password",
      )}<p style="color:#6b6b74;font-size:13px">If you did not ask for this, you can ignore this email.</p>`,
    ),
  });
}

export async function resetPassword(token: string, newPassword: string, ip: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await withTransaction(async (db) => {
    const result = await db.query<{ admin_id: string }>(
      `UPDATE admin_password_resets SET used_at = NOW()
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       RETURNING admin_id`,
      [sha256Hex(token)],
    );
    const row = result.rows[0];
    if (row === undefined) throw badRequest("invalid_token", "This reset link is invalid or has expired");

    await db.query(
      `UPDATE admin_users SET password_hash = $2, must_change_password = FALSE, failed_attempts = 0, locked_until = NULL
       WHERE id = $1`,
      [row.admin_id, passwordHash],
    );
    await db.query(`DELETE FROM admin_sessions WHERE admin_id = $1`, [row.admin_id]);
    await db.query(`DELETE FROM admin_password_resets WHERE admin_id = $1 AND used_at IS NULL`, [row.admin_id]);
    await audit(row.admin_id, "admin.password_reset", {}, ip, db);
  });
}

export async function changeCredentials(input: {
  adminId: string;
  sessionHash: string;
  currentPassword: string;
  newEmail: string | undefined;
  newPassword: string | undefined;
  ip: string;
}): Promise<{ email: string }> {
  const result = await pool.query<AdminRow>(`SELECT * FROM admin_users WHERE id = $1`, [input.adminId]);
  const admin = result.rows[0];
  if (admin === undefined) throw new AppError(401, "unauthorized", "Please sign in again");
  if (!(await verifyPassword(input.currentPassword, admin.password_hash))) {
    throw badRequest("wrong_password", "Current password is incorrect", { currentPassword: "Incorrect password" });
  }
  if (admin.must_change_password && input.newPassword === undefined) {
    throw badRequest("password_required", "Set a new password to continue", { newPassword: "Required" });
  }
  if (input.newPassword !== undefined && input.newPassword === input.currentPassword) {
    throw badRequest("same_password", "Choose a different password", { newPassword: "Must differ from current" });
  }

  const email = input.newEmail?.toLowerCase() ?? admin.email;
  const passwordHash = input.newPassword === undefined ? admin.password_hash : await hashPassword(input.newPassword);

  try {
    await withTransaction(async (db) => {
      await db.query(
        `UPDATE admin_users SET email = $2, password_hash = $3, must_change_password = FALSE WHERE id = $1`,
        [admin.id, email, passwordHash],
      );
      // Sign out every other device; keep the current session.
      await db.query(`DELETE FROM admin_sessions WHERE admin_id = $1 AND token_hash <> $2`, [admin.id, input.sessionHash]);
      await audit(
        admin.id,
        "admin.credentials_changed",
        { emailChanged: email !== admin.email, passwordChanged: input.newPassword !== undefined },
        input.ip,
        db,
      );
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw conflict("email_taken", "Another admin already uses this email");
    throw error;
  }
  return { email };
}
