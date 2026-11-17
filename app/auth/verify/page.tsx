import Link from "next/link";
import PageHero from "@/components/PageHero";

export const dynamic = "force-dynamic";

/**
 * Legacy magic-link destination. Auth is now email/password or email OTP.
 */
export default async function VerifyPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12 lg:px-8 lg:py-20">
      <PageHero
        eyebrow="Sign in updated"
        title={
          <>
            Magic links are <span className="gradient-text">gone.</span>
          </>
        }
        subtitle="Sign in with your email and password, or request a 6-digit email code. No more clicking links from your inbox."
        spotlight="violet"
        center
        compact
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary">
            Go to sign in
          </Link>
          <Link href="/" className="btn-ghost">
            Back home
          </Link>
        </div>
      </PageHero>
    </div>
  );
}
