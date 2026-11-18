import { NextResponse } from "next/server";
import { verifyPhoneOtp } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone ?? "");
    const code = String(body?.code ?? "");
    const customer = await verifyPhoneOtp(phone, code, {
      name: body?.name ? String(body.name) : undefined,
      email: body?.email ? String(body.email) : undefined,
      gender: body?.gender ? String(body.gender) : undefined,
    });
    return NextResponse.json({
      ok: true,
      phone: customer.phone,
      email: customer.email,
      name: customer.name,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not verify code.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
