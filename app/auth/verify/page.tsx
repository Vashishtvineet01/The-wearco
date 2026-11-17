import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Legacy magic-link destination. Auth is now email/password or email OTP —
 * send people to /login instead of consuming old tokens.
 */
export default async function VerifyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center lg:px-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
        // Sign in updated
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        Magic links are gone.
      </h1>
      <p className="mt-3 text-paper-700">
        Sign in with your email and password, or request a 6-digit email code.
        No more clicking links from your inbox.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/login" className="btn-primary">
          Go to sign in
        </Link>
        <Link href="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
