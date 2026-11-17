import crypto from "crypto";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";
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
 *  1. Phone SMS OTP     → POST /api/auth/otp/send | /api/auth/otp/verify (default)
 *  2. Email + password  → POST /api/auth/register | /api/auth/login
 *  3. POST /api/auth/logout
 */

export async function getCustomerSession() {
  return getIronSession<CustomerSession>(
    await cookies(),
    customerSessionOptions
  );
}

export async function requireCustomer() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.customerId) return null;
  return session;
}

export async function establishCustomerSession(customer: {
  id: string;
  email?: string | null;
  phone?: string | null;
}) {
  const session = await getCustomerSession();
  session.isLoggedIn = true;
  session.customerId = customer.id;
  session.email = customer.email || undefined;
  session.phone = customer.phone || undefined;
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
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128
  );
}

/** Normalize Indian mobiles to E.164 (+91…). Accepts 10-digit, 91…, +91…. */
export function normalizePhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }
  if (String(raw || "").trim().startsWith("+") && digits.length >= 10) {
    return `+${digits}`;
  }
  return digits ? `+${digits}` : "";
}

export function isValidIndianPhone(phoneE164: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(phoneE164);
}

export function formatPhoneDisplay(phoneE164: string): string {
  if (/^\+91\d{10}$/.test(phoneE164)) {
    return `+91 ${phoneE164.slice(3, 8)} ${phoneE164.slice(8)}`;
  }
  return phoneE164;
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
    throw new Error(
      "An account with this email already exists. Sign in instead."
    );
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

export function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function sendPhoneOtp(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!isValidIndianPhone(phone)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }

  const code = generateOtpCode();
  const tokenHash = hashToken(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.magicLinkToken.updateMany({
    where: { phone, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.magicLinkToken.create({
    data: { phone, tokenHash, expiresAt },
  });

  await sendOtpSms(phone, code);
  return { phone, expiresAt };
}

export async function verifyPhoneOtp(rawPhone: string, rawCode: string) {
  const phone = normalizePhone(rawPhone);
  const code = String(rawCode || "").replace(/\s+/g, "");
  if (!isValidIndianPhone(phone)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }
  if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit code.");

  const tokenHash = hashToken(code);
  const record = await prisma.magicLinkToken.findUnique({
    where: { tokenHash },
  });
  if (!record || record.phone !== phone) {
    throw new Error("Invalid or expired code.");
  }
  if (record.usedAt) throw new Error("Invalid or expired code.");
  if (record.expiresAt < new Date()) throw new Error("Invalid or expired code.");

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  void prisma.magicLinkToken
    .deleteMany({ where: { expiresAt: { lt: new Date() } } })
    .catch(() => {});

  await establishCustomerSession(customer);
  return customer;
}
