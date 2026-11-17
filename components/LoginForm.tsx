"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Method = "phone" | "password";
type Mode = "signin" | "signup";
type OtpStep = "phone" | "code";

/**
 * Phone SMS OTP (default) or email + password. No magic links / email OTP.
 */
export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/account";

  const [method, setMethod] = useState<Method>("phone");
  const [mode, setMode] = useState<Mode>("signin");
  const [otpStep, setOtpStep] = useState<OtpStep>("phone");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);

  const finish = () => {
    router.push(next);
    router.refresh();
  };

  const onSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneDigits }),
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
        body: JSON.stringify({ phone: phoneDigits, code }),
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

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl lg:grid-cols-2">
        {/* Brand strip */}
        <aside className="relative hidden overflow-hidden bg-ink-950 text-paper-50 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-aurora opacity-90"
            style={{ backgroundSize: "200% 200%" }}
          />
          <div
            aria-hidden
            className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-signal-lime/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-signal-coral/40 blur-3xl"
          />
          <div className="relative">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-50/70">
              // TheWearCo
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight xl:text-6xl">
              Internet
              <br />
              uniform.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper-50/80">
              Sign in with your mobile. Orders stay guest-friendly — an account
              just saves them for next time.
            </p>
          </div>
          <div className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-paper-50/50">
            Drop 03 · QR Layer · Live
          </div>
        </aside>

        {/* Form panel */}
        <section className="relative flex flex-col justify-center bg-paper-50 px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
          {/* Mobile brand header */}
          <div className="mb-8 lg:hidden">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
              // Sign in
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Your <span className="gradient-text">mobile.</span>
            </h1>
            <p className="mt-2 text-sm text-paper-700">
              Phone OTP by default. Guest checkout still works.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="hidden lg:block">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
                // {method === "phone" ? "Phone OTP" : mode === "signup" ? "Create account" : "Email & password"}
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
                {method === "phone" ? (
                  <>
                    Enter your <span className="gradient-text">number.</span>
                  </>
                ) : mode === "signup" ? (
                  <>
                    Join <span className="gradient-text">TheWearCo.</span>
                  </>
                ) : (
                  <>
                    Welcome <span className="gradient-text">back.</span>
                  </>
                )}
              </h2>
            </div>

            {/* Method switch */}
            <div className="mt-6 flex rounded-full border border-paper-200 bg-paper-100/80 p-1">
              {(
                [
                  ["phone", "Phone OTP"],
                  ["password", "Email & password"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMethod(id);
                    setError("");
                    setOtpStep("phone");
                    setCode("");
                  }}
                  className={`flex-1 rounded-full px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition sm:text-[11px] ${
                    method === id
                      ? "bg-ink-950 text-paper-50 shadow-sm"
                      : "text-paper-600 hover:text-paper-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Phone OTP */}
            {method === "phone" && (
              <div className="mt-6">
                {otpStep === "phone" ? (
                  <form onSubmit={onSendOtp} className="flex flex-col gap-4">
                    <Field label="Mobile number">
                      <div className="flex overflow-hidden rounded-2xl border border-paper-200 bg-white focus-within:border-signal-violetInk/50">
                        <span className="flex items-center border-r border-paper-200 bg-paper-100 px-4 font-mono text-sm text-paper-700">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          required
                          autoFocus
                          value={phoneDigits}
                          onChange={(e) =>
                            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                          }
                          placeholder="98xxxxxxxx"
                          className="w-full bg-transparent px-4 py-3.5 text-base outline-none"
                          autoComplete="tel-national"
                          maxLength={10}
                        />
                      </div>
                    </Field>
                    <button
                      type="submit"
                      disabled={submitting || phoneDigits.length !== 10}
                      className="btn-primary w-full py-3.5 disabled:opacity-60"
                    >
                      {submitting ? "Sending…" : "Send OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={onVerifyOtp} className="flex flex-col gap-4">
                    <p className="text-sm text-paper-700">
                      Code sent to{" "}
                      <span className="font-semibold text-paper-900">
                        +91 {phoneDigits}
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
                        placeholder="••••••"
                        className="w-full rounded-2xl border border-paper-200 bg-white px-4 py-3.5 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-signal-violetInk/50"
                        autoComplete="one-time-code"
                      />
                    </Field>
                    <button
                      type="submit"
                      disabled={submitting || code.length !== 6}
                      className="btn-primary w-full py-3.5 disabled:opacity-60"
                    >
                      {submitting ? "Verifying…" : "Verify & continue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep("phone");
                        setCode("");
                        setError("");
                      }}
                      className="text-sm text-signal-violetInk underline underline-offset-4"
                    >
                      Use a different number
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Email + password */}
            {method === "password" && (
              <div className="mt-6">
                <div className="mb-4 flex rounded-full border border-paper-200 p-1">
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
                      }}
                      className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ${
                        mode === id
                          ? "bg-signal-lime/15 text-signal-limeInk"
                          : "text-paper-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={onPasswordSubmit}
                  className="flex flex-col gap-3"
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
                    className="btn-primary mt-1 w-full py-3.5 disabled:opacity-60"
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
              </div>
            )}

            {error && (
              <p className="mt-4 text-center text-sm text-signal-coral">{error}</p>
            )}

            <p className="mt-10 text-center text-xs text-paper-500">
              No account needed to shop —{" "}
              <Link href="/shop" className="underline underline-offset-2">
                check out as a guest
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-paper-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-signal-violetInk/50";

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
