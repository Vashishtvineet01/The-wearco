import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Deprecated — magic links were replaced by email/password + email OTP.
 * Kept so old clients get a clear error instead of a silent 404.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Magic links are no longer supported. Use email/password or email OTP at /login.",
    },
    { status: 410 }
  );
}
