import { NextResponse } from "next/server";
import {
  isValidIndianPhone,
  normalizePhone,
  sendPhoneOtp,
} from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * Send SMS OTP. Returns { isNew } so the client can show the
 * complete-profile form for first-time numbers.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = normalizePhone(String(body?.phone ?? ""));
    if (!isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number." },
        { status: 400 },
      );
    }
    const result = await sendPhoneOtp(phone);
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      isNew: result.isNew,
    });
  } catch (e) {
    console.error("[otp/send]", e);
    const message =
      e instanceof Error ? e.message : "Could not send code.";
    if (message.includes("Could not send")) {
      return NextResponse.json({ error: message }, { status: 502 });
    }
    return NextResponse.json({ ok: true, isNew: true });
  }
}
