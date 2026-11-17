import crypto from "crypto";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import {
  customerSessionOptions,
  type CustomerSession,
} from "@/lib/customer-session-options";

export {
  customerSessionOptions,
  type CustomerSession,
} from "@/lib/customer-session-options";

/**
 * Customer-side (not admin) sessions. Separate iron-session cookie so an
 * admin login can't accidentally impersonate a buyer and vice-versa.
 *
 * Auth model: passwordless magic links.
 *  1. POST /api/auth/magic-link { email } → emails a one-time URL
 *  2. GET  /auth/verify?token=...         → sets the session cookie
 *  3. POST /api/auth/logout               → clears the cookie
 *
 * Orders are joined by email match, not customer id, so guest purchases
 * made before signup still show up in /account once the user logs in.
 */

export async function getCustomerSession() {
  return getIronSession<CustomerSession>(
    await cookies(),
    customerSessionOptions
  );
}

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.email) return null;
  return session;
}

// ─────────────────────── Magic link helpers ───────────────────────

/** Random URL-safe token. 32 bytes = 256 bits of entropy. */
export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/** Only the hash is stored in the DB so a leaked row can't be replayed. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Send a magic link to the given email. Always resolves — we deliberately
 * don't leak whether an account exists (classic anti-enumeration pattern).
 */
export async function sendMagicLink(
  rawEmail: string,
  { name, next }: { name?: string; next?: string } = {}
) {
  const email = rawEmail.toLowerCase().trim();
  if (!email || !email.includes("@")) return;

  const token = generateMagicToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.magicLinkToken.create({
    data: { email, tokenHash, expiresAt },
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://the-wearco.vercel.app";
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const link = `${siteUrl}/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(
      `[magic-link] RESEND_API_KEY not set — login link for ${email}:\n  ${link}`
    );
    return;
  }

  const resend = new Resend(key);
  const from = process.env.MAIL_FROM || "TheWearCo <orders@thewearco.com>";
  const replyTo = process.env.MAIL_REPLY_TO || "hi@thewearco.com";

  const safeName = escapeHtml(name || email.split("@")[0]);
  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0d0a;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#4a6b00;font-family:ui-monospace,monospace;">
        // Sign in link
      </div>
      <h1 style="margin:12px 0 4px;font-size:26px;font-weight:800;letter-spacing:-0.4px;">
        Sign in to TheWearCo, ${safeName}.
      </h1>
      <p style="margin:0 0 20px;color:#4a4737;font-size:15px;line-height:1.5;">
        Click the button below to finish signing in. This link works once and
        expires in 15 minutes.
      </p>
      <div style="margin:24px 0 32px;text-align:left;">
        <a href="${link}" style="display:inline-block;padding:14px 22px;background:#0f0d0a;color:#fff;text-decoration:none;border-radius:999px;font-weight:700;font-size:14px;">
          Sign in →
        </a>
      </div>
      <p style="margin:0;font-size:12px;color:#6b6859;line-height:1.5;">
        If the button doesn't work, paste this URL into your browser:<br/>
        <a href="${link}" style="color:#4a2bff;word-break:break-all;">${link}</a>
      </p>
      <p style="margin-top:32px;font-size:12px;color:#6b6859;line-height:1.5;">
        Didn't ask for this? You can safely ignore the email — someone may
        have typed your address by mistake.<br/>
        Questions? Write to
        <a href="mailto:${replyTo}" style="color:#4a2bff;">${replyTo}</a>.
      </p>
    </div>
  </body>
</html>`;

  try {
    await resend.emails.send({
      from,
      to: email,
      replyTo,
      subject: "Your TheWearCo sign-in link",
      html,
    });
  } catch (e) {
    console.error("[magic-link] send failed:", e);
  }
}

/**
 * Consume a magic link. Returns the matching customer row (creating it on
 * first use) when the token is valid, unused and unexpired. Returns null
 * for anything else — the caller shows a friendly "link invalid or
 * expired" screen and does not branch on the specific reason.
 */
export async function consumeMagicLink(rawToken: string) {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
  });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  // Mark used + upsert customer atomically-ish.
  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const email = record.email.toLowerCase().trim();
  const customer = await prisma.customer.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  // Best-effort cleanup — expired tokens are useless.
  void prisma.magicLinkToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});

  return customer;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
