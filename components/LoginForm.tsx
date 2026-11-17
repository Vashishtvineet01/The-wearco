"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Aurora from "@/components/Aurora";

/**
 * Passwordless login — single email field, posts to /api/auth/magic-link,
 * swaps to a "check your email" confirmation on success.
 */
export default function LoginForm() {
  const search = useSearchParams();
  const nextParam = search.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account";

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not send link");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-lg px-5 py-16 lg:px-8 lg:py-24">
      <section className="spotlight-violet relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 p-8 text-center md:p-12">
        <Aurora
          blobs={[
            {
              color: "violet",
              size: 360,
              top: "-120px",
              left: "-100px",
              opacity: 0.5,
            },
            {
              color: "coral",
              size: 320,
              top: "-60px",
              right: "-70px",
              delay: 3,
              opacity: 0.4,
            },
            {
              color: "lime",
              size: 260,
              bottom: "-120px",
              left: "25%",
              delay: 6,
              opacity: 0.35,
              slow: true,
            },
          ]}
        />
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Sign in
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {sent ? (
              <>
                Check your <span className="gradient-text">inbox.</span>
              </>
            ) : (
              <>
                Just an <span className="gradient-text">email.</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-paper-700">
            {sent
              ? `We sent a one-time sign-in link to ${email}. It works once and expires in 15 minutes.`
              : "No passwords, no OAuth. Drop your email and we'll send a one-click link to sign in."}
          </p>

          {!sent && (
            <form
              onSubmit={onSubmit}
              className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                autoFocus
                placeholder="you@startup.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-full border border-paper-200 bg-paper-50 px-5 py-3 text-sm outline-none transition focus:border-signal-violetInk/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send link"}
              </button>
            </form>
          )}

          {error && <p className="mt-3 text-sm text-signal-coral">{error}</p>}

          {sent && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <button
                onClick={() => {
                  setSent(false);
                  setError("");
                }}
                className="text-signal-violetInk underline underline-offset-4"
              >
                Use a different email
              </button>
              <span className="text-paper-400">·</span>
              <Link href="/shop" className="text-paper-600 hover:text-paper-900">
                Keep shopping
              </Link>
            </div>
          )}

          <p className="mt-8 text-xs text-paper-500">
            No account needed to shop — you can{" "}
            <Link href="/shop" className="underline underline-offset-2">
              check out as a guest
            </Link>
            . An account just saves your orders for next time.
          </p>
        </div>
      </section>
    </div>
  );
}
