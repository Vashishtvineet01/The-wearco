import { NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * POST { email } → always 200 "we've sent you a link if that email is valid".
 *
 * Deliberately doesn't reveal whether the email is on file — this is the
 * standard anti-enumeration pattern for passwordless auth.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim();
    const next = typeof body?.next === "string" ? body.next : undefined;
    if (!email || !email.includes("@") || email.length > 200) {
      return NextResponse.json(
        { error: "Enter a valid email." },
        { status: 400 }
      );
    }
    await sendMagicLink(email, { next });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[magic-link]", e);
    // Still return ok so we don't expose server-side errors to the client.
    return NextResponse.json({ ok: true });
  }
}
