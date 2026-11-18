"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "./BrandLogo";
import ProductMockup from "./ProductMockup";

type Method = "phone" | "password";
type Mode = "signin" | "signup";
type OtpStep = "phone" | "code" | "profile";
type Gender = "male" | "female" | "other";

/**
 * Bewakoof-style split login:
 *  - existing phone → OTP only
 *  - new phone → complete profile (name, email, gender) + OTP
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
  const [gender, setGender] = useState<Gender>("male");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);
  const canContinue = phoneDigits.length === 10;
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const finish = () => {
    router.push(next);
    router.refresh();
  };

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const startResendTimer = () => setResendIn(30);

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
      setCode("");
      setOtpStep(data.isNew ? "profile" : "code");
      startResendTimer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (resendIn > 0 || submitting) return;
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
      startResendTimer();
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
      const payload: Record<string, string> = {
        phone: phoneDigits,
        code,
      };
      if (otpStep === "profile") {
        payload.name = name.trim();
        payload.email = email.trim();
        payload.gender = gender;
      }
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const setOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const chars = prev.padEnd(6, " ").split("");
      chars[index] = digit || " ";
      return chars.join("").replace(/ /g, "").slice(0, 6);
    });
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const applyOtpPaste = (pasted: string) => {
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  const onOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const profileReady =
    name.trim().length >= 2 &&
    email.includes("@") &&
    code.length === 6;

  const resetToPhone = () => {
    setOtpStep("phone");
    setCode("");
    setName("");
    setEmail("");
    setGender("male");
    setError("");
  };

  return (
    <div className="relative w-full bg-white">
      <div className="grid min-h-[calc(100vh-5rem)] w-full lg:grid-cols-2">
        <aside className="relative hidden min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1a1511] lg:block">
          <div
            aria-hidden
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(180,83,9,0.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(124,45,18,0.4), transparent 50%), #14110e",
            }}
          />
          <div className="relative flex h-full flex-col p-10 xl:p-12">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-[#f59e0b] px-3 py-2 shadow-lg">
                <BrandLogo href={null} size="sm" showWordmark={false} />
              </div>
              <p className="pt-1 font-display text-3xl font-bold uppercase leading-none tracking-tight text-[#fff8eb] xl:text-4xl">
                All eyes <span className="text-[#fde68a]">on you</span>
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4 pb-4 pt-16">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <ProductMockup
                  category="tee"
                  fabric="#0e0e10"
                  printText="WEAR"
                  printColor="#fde68a"
                  className="mx-auto max-h-[220px]"
                />
              </div>
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <ProductMockup
                  category="hoodie"
                  fabric="#ece7dd"
                  printText="CO"
                  printColor="#0a0a0a"
                  className="mx-auto max-h-[220px]"
                />
              </div>
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[#fff8eb]/55">
              Shop it · Design it · Wear it
            </p>
          </div>
        </aside>

        <section className="relative flex flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:px-16 xl:px-20">
          <div className="mx-auto w-full max-w-[400px]">
            {method === "phone" ? (
              <>
                {otpStep === "phone" && (
                  <>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-paper-900 sm:text-[2rem]">
                      Login / Signup
                    </h1>
                    <p className="mt-2 text-sm text-paper-500">
                      Join us now to be a part of TheWearCo family.
                    </p>
                    <p className="mt-4 rounded-lg border border-[#fde68a] bg-[#fff8eb] px-3 py-2 text-xs text-[#92400e]">
                      Test mode: any 10-digit number + any 6-digit code works.
                    </p>

                    <form onSubmit={onSendOtp} className="mt-8 flex flex-col gap-4">
                      <FieldLabel>Mobile Number</FieldLabel>
                      <PhoneInput
                        value={phoneDigits}
                        onChange={setPhone}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={submitting || !canContinue}
                        className={primaryBtn(canContinue && !submitting)}
                      >
                        {submitting ? "Sending…" : "Continue"}
                      </button>
                    </form>
                  </>
                )}

                {otpStep === "code" && (
                  <>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-paper-900">
                      Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-paper-500">
                      Enter the OTP sent to{" "}
                      <span className="font-semibold text-paper-900">
                        +91 {phoneDigits}
                      </span>
                    </p>
                    <form onSubmit={onVerifyOtp} className="mt-8 flex flex-col gap-5">
                      <OtpBoxes
                        code={code}
                        refs={otpRefs}
                        onDigit={setOtpDigit}
                        onPaste={applyOtpPaste}
                        onKeyDown={onOtpKeyDown}
                      />
                      <ResendRow resendIn={resendIn} onResend={onResend} />
                      <button
                        type="submit"
                        disabled={submitting || code.length !== 6}
                        className={primaryBtn(code.length === 6 && !submitting)}
                      >
                        {submitting ? "Verifying…" : "Continue"}
                      </button>
                      <button
                        type="button"
                        onClick={resetToPhone}
                        className="text-sm text-paper-600 underline underline-offset-4 hover:text-paper-900"
                      >
                        Use a different number
                      </button>
                    </form>
                  </>
                )}

                {otpStep === "profile" && (
                  <>
                    <p className="text-sm text-paper-500">
                      We need few more details to personalize your experience.
                    </p>
                    <form
                      onSubmit={onVerifyOtp}
                      className="mt-6 flex flex-col gap-4"
                    >
                      <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex - Jhon Sharma"
                          className={inputClass}
                          autoComplete="name"
                        />
                      </div>

                      <div>
                        <FieldLabel>Mobile Number</FieldLabel>
                        <PhoneInput value={phoneDigits} onChange={() => {}} readOnly />
                      </div>

                      <div>
                        <FieldLabel>Email ID</FieldLabel>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ex: yourmailid@gmail.com"
                          className={inputClass}
                          autoComplete="email"
                        />
                      </div>

                      <div>
                        <FieldLabel>Gender</FieldLabel>
                        <div className="mt-1.5 grid grid-cols-3 gap-2">
                          {(["male", "female", "other"] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setGender(g)}
                              className={`h-11 rounded-lg border text-sm font-semibold capitalize transition ${
                                gender === g
                                  ? "border-[#f59e0b] bg-[#fff8eb] text-paper-900"
                                  : "border-paper-300 bg-white text-paper-700 hover:border-paper-500"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <FieldLabel>OTP</FieldLabel>
                        <OtpBoxes
                          code={code}
                          refs={otpRefs}
                          onDigit={setOtpDigit}
                          onPaste={applyOtpPaste}
                          onKeyDown={onOtpKeyDown}
                        />
                        <ResendRow resendIn={resendIn} onResend={onResend} />
                        <p className="mt-1 text-[11px] text-[#b45309]">
                          Test mode — any 6 digits (e.g. 123456).
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !profileReady}
                        className={primaryBtn(profileReady && !submitting)}
                      >
                        {submitting ? "Creating…" : "Continue"}
                      </button>
                      <button
                        type="button"
                        onClick={resetToPhone}
                        className="text-sm text-paper-600 underline underline-offset-4 hover:text-paper-900"
                      >
                        Use a different number
                      </button>
                    </form>
                  </>
                )}

                {otpStep === "phone" && (
                  <>
                    <div className="my-8 flex items-center gap-3">
                      <span className="h-px flex-1 bg-paper-200" />
                      <span className="text-xs font-medium uppercase tracking-wider text-paper-400">
                        Or
                      </span>
                      <span className="h-px flex-1 bg-paper-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMethod("password");
                          setMode("signin");
                          setError("");
                        }}
                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-paper-300 bg-white text-sm font-semibold text-paper-800 transition hover:border-paper-500 hover:bg-paper-50"
                      >
                        <EmailIcon />
                        Email
                      </button>
                      <Link
                        href="/shop"
                        className="flex h-11 items-center justify-center gap-2 rounded-lg border border-paper-300 bg-white text-sm font-semibold text-paper-800 transition hover:border-paper-500 hover:bg-paper-50"
                      >
                        <BagIcon />
                        Guest
                      </Link>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMethod("phone");
                    setError("");
                  }}
                  className="mb-4 text-sm font-medium text-paper-600 underline-offset-4 hover:text-paper-900 hover:underline"
                >
                  ← Back to mobile
                </button>
                <h1 className="font-display text-3xl font-bold tracking-tight text-paper-900">
                  {mode === "signup" ? "Create account" : "Login with email"}
                </h1>
                <p className="mt-2 text-sm text-paper-500">
                  Or use{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "signup" ? "signin" : "signup");
                      setError("");
                    }}
                    className="font-semibold text-[#b45309] underline-offset-2 hover:underline"
                  >
                    {mode === "signup" ? "sign in" : "create an account"}
                  </button>
                  .
                </p>

                <form
                  onSubmit={onPasswordSubmit}
                  className="mt-8 flex flex-col gap-3"
                >
                  {mode === "signup" && (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name (optional)"
                      className={inputClass}
                      autoComplete="name"
                    />
                  )}
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className={inputClass}
                    autoComplete="email"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "signup" ? "Password (min 8 chars)" : "Password"
                    }
                    className={inputClass}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 h-12 w-full rounded-lg bg-paper-900 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-paper-800 disabled:opacity-60"
                  >
                    {submitting
                      ? mode === "signup"
                        ? "Creating…"
                        : "Signing in…"
                      : mode === "signup"
                        ? "Create account"
                        : "Continue"}
                  </button>
                </form>
              </>
            )}

            {error && (
              <p className="mt-4 text-center text-sm text-[#c2410c]">{error}</p>
            )}

            <p className="mt-10 text-center text-[11px] leading-relaxed text-paper-500">
              By creating an account or logging in, you agree with TheWearCo&apos;s{" "}
              <Link
                href="/terms"
                className="font-semibold text-[#0ea5e9] hover:underline"
              >
                T&amp;C
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#0ea5e9] hover:underline"
              >
                Privacy Policy
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
  "mt-1.5 h-12 w-full rounded-lg border border-paper-300 bg-white px-4 text-[15px] outline-none transition placeholder:text-paper-400 focus:border-paper-900";

function primaryBtn(ready: boolean) {
  return `h-12 w-full rounded-lg text-sm font-bold uppercase tracking-[0.08em] transition ${
    ready
      ? "bg-paper-900 text-white hover:bg-paper-800 active:scale-[0.99]"
      : "cursor-not-allowed bg-paper-200 text-paper-500"
  }`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium text-paper-500">{children}</div>
  );
}

function PhoneInput({
  value,
  onChange,
  autoFocus,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div
      className={`mt-1.5 flex h-12 items-stretch overflow-hidden rounded-lg border border-paper-300 bg-white transition ${
        readOnly ? "bg-paper-50" : "focus-within:border-paper-900"
      }`}
    >
      <span className="flex items-center gap-1.5 border-r border-paper-200 bg-paper-50 px-3 text-sm text-paper-800">
        <IndiaFlag />
        <span className="font-medium">+91</span>
      </span>
      <input
        type="tel"
        inputMode="numeric"
        required
        autoFocus={autoFocus}
        readOnly={readOnly}
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
        }
        placeholder="Enter Mobile Number"
        className="w-full bg-transparent px-3 text-[15px] text-paper-900 outline-none placeholder:text-paper-400 read-only:cursor-default"
        autoComplete="tel-national"
        maxLength={10}
        aria-label="Mobile number"
      />
    </div>
  );
}

function OtpBoxes({
  code,
  refs,
  onDigit,
  onPaste,
  onKeyDown,
}: {
  code: string;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onDigit: (index: number, value: string) => void;
  onPaste: (pasted: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mt-1.5 flex justify-between gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[i] || ""}
          onChange={(e) => onDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={(e) => {
            e.preventDefault();
            onPaste(e.clipboardData.getData("text"));
          }}
          className="h-12 w-11 rounded-lg border border-paper-300 text-center font-mono text-lg outline-none transition focus:border-paper-900 sm:w-12"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

function ResendRow({
  resendIn,
  onResend,
}: {
  resendIn: number;
  onResend: () => void;
}) {
  return (
    <div className="mt-2 text-xs text-paper-500">
      {resendIn > 0 ? (
        <>Resend OTP in {resendIn} sec</>
      ) : (
        <button
          type="button"
          onClick={onResend}
          className="font-semibold text-[#b45309] underline-offset-2 hover:underline"
        >
          Resend OTP
        </button>
      )}
    </div>
  );
}

function IndiaFlag() {
  return (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] shadow-sm"
      aria-hidden
    >
      <rect width="24" height="16" fill="#FF9933" />
      <rect y="5.33" width="24" height="5.34" fill="#fff" />
      <rect y="10.67" width="24" height="5.33" fill="#138808" />
      <circle cx="12" cy="8" r="1.6" fill="#000080" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 7h12l1 14H5L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}
