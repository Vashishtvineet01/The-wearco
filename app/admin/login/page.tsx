"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("admin@thewearco.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.replace(search.get("next") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
          // Admin
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-ink-300">Manage products, orders and drops.</p>

        <label className="mt-6 block">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
            Email
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
          />
        </label>

        <label className="mt-4 block">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-300">
            Password
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm outline-none focus:border-signal-lime/40"
          />
        </label>

        {error && <p className="mt-3 text-xs text-signal-coral">{error}</p>}

        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
