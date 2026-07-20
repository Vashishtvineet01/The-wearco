"use client";

import { useState } from "react";

type Props = {
  variant?: "footer" | "centered";
  buttonLabel?: string;
  placeholder?: string;
};

export default function NewsletterForm({
  variant = "footer",
  buttonLabel = "Notify me",
  placeholder = "you@startup.in"
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }
      setStatus("done");
      setEmail("");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const wrapperClass =
    variant === "centered"
      ? "mx-auto mt-6 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1"
      : "flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1";

  return (
    <div>
      <form onSubmit={onSubmit} className={wrapperClass} aria-label="Drop alerts signup">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={status === "loading"}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-50 outline-none placeholder:text-ink-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-signal-lime px-4 py-2 text-xs font-medium text-ink-950 transition hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "done"
            ? "On the list"
            : status === "loading"
              ? "Saving..."
              : buttonLabel}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-signal-coral">{error}</p>
      )}
    </div>
  );
}
