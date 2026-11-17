import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "");
    const password = String(body?.password ?? "");
    const customer = await loginWithPassword(email, password);
    return NextResponse.json({
      ok: true,
      email: customer.email,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
