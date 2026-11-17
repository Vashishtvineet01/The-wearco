import { NextResponse } from "next/server";
import { verifyEmailOtp } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "");
    const code = String(body?.code ?? "");
    const customer = await verifyEmailOtp(email, code);
    return NextResponse.json({
      ok: true,
      email: customer.email,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
