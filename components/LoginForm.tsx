"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Aurora from "@/components/Aurora";

type Mode = "signin" | "signup";
type Method = "password" | "otp";
type OtpStep = "email" | "code";

/**
 * Email + password, or email OTP. No magic links.
 */
export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account";

  const [mode, setMode] = useState<Mode>("signin");
  const [method, setMethod] = useState<Method>("password");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const finish = () => {
    router.push(next);
    router.refresh();
  };

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const path = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(mode === "signup" && name ? { name } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const onSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setOtpStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Invalid code");
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-lg px-5 py-10 sm:py-16 lg:px-8 lg:py-20">
      <section className="spotlight-violet relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 p-6 sm:p-8 md:p-12">
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
          <div className="text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // {mode === "signup" ? "Create account" : "Sign in"}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {mode === "signup" ? (
                <>
                  Join <span className="gradient-text">TheWearCo.</span>
                </>
              ) : (
                <>
                  Welcome <span className="gradient-text">back.</span>
                </>
              )}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-paper-700 sm:text-base">
              Use your email and password, or get a one-time code. No magic
              links.
            </p>
          </div>

          {/* Mode: sign in / create */}
          <div className="mx-auto mt-5 flex max-w-md rounded-full border border-paper-200 bg-paper-100/80 p-1 sm:mt-6">
            {(
              [
                ["signin", "Sign in"],
                ["signup", "Create account"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setError("");
                  setOtpStep("email");
                  if (id === "signup") setMethod("password");
                }}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                  mode === id
                    ? "bg-ink-950 text-paper-50"
                    : "text-paper-700 hover:text-paper-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Method: password / OTP (OTP only on sign-in — signup needs password) */}
          {mode === "signin" && (
            <div className="mx-auto mt-4 flex max-w-md gap-2">
              {(
                [
                  ["password", "Password"],
                  ["otp", "Email OTP"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMethod(id);
                    setError("");
                    setOtpStep("email");
                    setCode("");
                  }}
                  className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                    method === id
                      ? "border-signal-lime/50 bg-signal-lime/10 text-signal-limeInk"
                      : "border-paper-200 bg-paper-50 text-paper-600 hover:border-paper-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Password form */}
          {(method === "password" || mode === "signup") && (
            <form
              onSubmit={onPasswordSubmit}
              className="mx-auto mt-6 flex max-w-md flex-col gap-3"
            >
              {mode === "signup" && (
                <Field label="Name (optional)">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav"
                    className={inputClass}
                    autoComplete="name"
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@startup.in"
                  className={inputClass}
                  autoComplete="email"
                />
              </Field>
              <Field
                label={
                  mode === "signup" ? "Password (min 8 chars)" : "Password"
                }
              >
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                />
              </Field>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-2 w-full disabled:opacity-60"
              >
                {submitting
                  ? mode === "signup"
                    ? "Creating…"
                    : "Signing in…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>
          )}

          {/* OTP form */}
          {mode === "signin" && method === "otp" && (
            <div className="mx-auto mt-6 max-w-md">
              {otpStep === "email" ? (
                <form onSubmit={onSendOtp} className="flex flex-col gap-3">
                  <Field label="Email">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@startup.in"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </Field>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary mt-2 w-full disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send 6-digit code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={onVerifyOtp} className="flex flex-col gap-3">
                  <p className="text-sm text-paper-700">
                    Code sent to{" "}
                    <span className="font-semibold text-paper-900">
                      {email}
                    </span>
                    . Expires in 10 minutes.
                  </p>
                  <Field label="6-digit code">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoFocus
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="123456"
                      className={`${inputClass} font-mono tracking-[0.35em]`}
                      autoComplete="one-time-code"
                    />
                  </Field>
                  <button
                    type="submit"
                    disabled={submitting || code.length !== 6}
                    className="btn-primary mt-2 w-full disabled:opacity-60"
                  >
                    {submitting ? "Verifying…" : "Verify & sign in"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep("email");
                      setCode("");
                      setError("");
                    }}
                    className="text-sm text-signal-violetInk underline underline-offset-4"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </div>
          )}

          {error && (
            <p className="mx-auto mt-4 max-w-md text-center text-sm text-signal-coral">
              {error}
            </p>
          )}

          <p className="mt-8 text-center text-xs text-paper-500">
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

const inputClass =
  "w-full rounded-full border border-paper-200 bg-paper-50 px-4 py-2.5 text-sm outline-none transition focus:border-signal-violetInk/50 sm:px-5 sm:py-3";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left">
      <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-600">
        {label}
      </div>
      {children}
    </label>
  );
}
