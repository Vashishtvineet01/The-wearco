import type { SessionOptions } from "iron-session";

/**
 * Edge-safe session options + types for customer auth.
 * Kept separate from `customer-session.ts` so middleware can import
 * without pulling Prisma / Resend into the Edge runtime.
 */
export type CustomerSession = {
  isLoggedIn: boolean;
  customerId?: string;
  email?: string;
};

export const customerSessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "thewearco-dev-session-secret-key-32chars",
  cookieName: "thewearco_customer",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
