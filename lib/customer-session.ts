import crypto from "crypto";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
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
 * Customer auth:
 *  1. Email + password  → POST /api/auth/register | /api/auth/login
 *  2. Email OTP         → POST /api/auth/otp/send  | /api/auth/otp/verify
 *  3. POST /api/auth/logout
 *
 * Orders join by email, so guest purchases still appear after signup.
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

export async function establishCustomerSession(customer: {
  id: string;
  email: string;
}) {
  const session = await getCustomerSession();
  session.isLoggedIn = true;
  session.customerId = customer.id;
  session.email = customer.email;
  await session.save();
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function normalizeEmail(raw: string): string {
  return raw.toLowerCase().trim();
}

export function isValidEmail(email: string): boolean {
  return Boolean(email && email.includes("@") && email.length <= 200);
}

export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 8 && password.length <= 128;
}

export async function registerWithPassword(
  rawEmail: string,
  password: string,
  name?: string
) {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) throw new Error("Enter a valid email.");
  if (!isValidPassword(password)) {
    throw new Error("Password must be at least 8 characters.");
  }

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    throw new Error("An account with this email already exists. Sign in instead.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = existing
    ? await prisma.customer.update({
        where: { email },
        data: {
          passwordHash,
          name: name?.trim() || existing.name || null,
        },
      })
    : await prisma.customer.create({
        data: {
          email,
          passwordHash,
          name: name?.trim() || null,
        },
      });

  await establishCustomerSession(customer);
  return customer;
}

export async function loginWithPassword(rawEmail: string, password: string) {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) throw new Error("Enter a valid email.");
  if (!password) throw new Error("Enter your password.");

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer?.passwordHash) {
    throw new Error("Invalid email or password.");
  }

  const ok = await bcrypt.compare(password, customer.passwordHash);
  if (!ok) throw new Error("Invalid email or password.");

  await establishCustomerSession(customer);
  return customer;
}

/** 6-digit numeric OTP. */
export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

/**
 * Create + email a 6-digit OTP. Always resolves for anti-enumeration
 * when called from the public send route (caller decides).
 */
export async function sendEmailOtp(rawEmail: string) {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) throw new Error("Enter a valid email.");

  const code = generateOtpCode();
  const tokenHash = hashToken(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate prior unused OTPs for this email.
  await prisma.magicLinkToken.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.magicLinkToken.create({
    data: { email, tokenHash, expiresAt },
  });

  await deliverOtpEmail(email, code);
  return { email, expiresAt };
}

export async function verifyEmailOtp(rawEmail: string, rawCode: string) {
  const email = normalizeEmail(rawEmail);
  const code = String(rawCode || "").replace(/\s+/g, "");
  if (!isValidEmail(email)) throw new Error("Enter a valid email.");
  if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit code.");

  const tokenHash = hashToken(code);
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
  });
  if (!record || record.email !== email) {
    throw new Error("Invalid or expired code.");
  }
  if (record.usedAt) throw new Error("Invalid or expired code.");
  if (record.expiresAt < new Date()) throw new Error("Invalid or expired code.");

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const customer = await prisma.customer.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  void prisma.magicLinkToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});

  await establishCustomerSession(customer);
  return customer;
}

async function deliverOtpEmail(email: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[otp] RESEND_API_KEY not set — OTP for ${email}: ${code}`);
    return;
  }

  const resend = new Resend(key);
  const from = process.env.MAIL_FROM || "TheWearCo <orders@thewearco.com>";
  const replyTo = process.env.MAIL_REPLY_TO || "hi@thewearco.com";
  const safeName = escapeHtml(email.split("@")[0]);

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#fafaf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f0d0a;">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
      <div style="font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:#4a6b00;font-family:ui-monospace,monospace;">
        // Sign-in code
      </div>
      <h1 style="margin:12px 0 4px;font-size:26px;font-weight:800;letter-spacing:-0.4px;">
        Your code, ${safeName}.
      </h1>
      <p style="margin:0 0 20px;color:#4a4737;font-size:15px;line-height:1.5;">
        Enter this 6-digit code on TheWearCo to sign in. It expires in 10 minutes.
      </p>
      <div style="margin:24px 0;padding:18px 22px;background:#0f0d0a;color:#fff;border-radius:16px;font-size:32px;font-weight:800;letter-spacing:8px;text-align:center;font-family:ui-monospace,monospace;">
        ${code}
      </div>
      <p style="margin-top:24px;font-size:12px;color:#6b6859;line-height:1.5;">
        Didn't ask for this? Ignore the email.<br/>
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
      subject: `${code} is your TheWearCo code`,
      html,
    });
  } catch (e) {
    console.error("[otp] send failed:", e);
    throw new Error("Could not send the code. Try again in a moment.");
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
