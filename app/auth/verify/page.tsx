import { redirect } from "next/navigation";
import Link from "next/link";
import {
  consumeMagicLink,
  getCustomerSession,
} from "@/lib/customer-session";

export const dynamic = "force-dynamic";

/**
 * GET /auth/verify?token=... — the destination of every magic-link email.
 *
 * - Valid token → set cookie, redirect to /account.
 * - Invalid/expired/used → show a friendly error with "request a new link".
 */
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token?.trim();
  const next = sp.next?.startsWith("/") ? sp.next : "/account";

  const customer = token ? await consumeMagicLink(token) : null;

  if (customer) {
    const session = await getCustomerSession();
    session.isLoggedIn = true;
    session.customerId = customer.id;
    session.email = customer.email;
    await session.save();
    redirect(next);
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center lg:px-8">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
        // Link invalid
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        That sign-in link didn&apos;t work.
      </h1>
      <p className="mt-3 text-paper-700">
        Sign-in links expire after 15 minutes and can only be used once. You
        might have clicked an older one, or the link was already used in
        another tab.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/login" className="btn-primary">
          Request a new link
        </Link>
        <Link href="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  );
}
