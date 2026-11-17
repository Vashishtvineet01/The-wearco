import { NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, sendEmailOtp } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * Always returns 200 on syntactically-valid email (anti-enumeration),
 * unless delivery itself hard-fails.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = normalizeEmail(String(body?.email ?? ""));
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email." },
        { status: 400 }
      );
    }
    await sendEmailOtp(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[otp/send]", e);
    const message =
      e instanceof Error ? e.message : "Could not send code.";
    // Soft-fail for anti-enumeration when Resend is missing / flaky —
    // still ok if it's just "couldn't send" after creating the token
    // in dev without RESEND (sendEmailOtp logs the code).
    if (message.includes("Could not send")) {
      return NextResponse.json({ error: message }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }
}
