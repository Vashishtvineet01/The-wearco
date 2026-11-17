import { NextResponse } from "next/server";
import { registerWithPassword } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "");
    const password = String(body?.password ?? "");
    const name =
      typeof body?.name === "string" ? body.name.trim() : undefined;

    const customer = await registerWithPassword(email, password, name);
    return NextResponse.json({
      ok: true,
      email: customer.email,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
