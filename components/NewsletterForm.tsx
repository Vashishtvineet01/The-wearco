"use client";

import { useState } from "react";

type Props = {
  variant?: "footer" | "centered" | "stacked";
  buttonLabel?: string;
  placeholder?: string;
};

export default function NewsletterForm({
  variant = "footer",
  buttonLabel = "Notify me",
  placeholder = "you@startup.in",
}: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
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
        body: JSON.stringify({ email }),
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

  const label =
    status === "done"
      ? "On the list"
      : status === "loading"
        ? "Saving..."
        : buttonLabel;

  if (variant === "stacked") {
    return (
      <div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-2"
          aria-label="Drop alerts signup"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={status === "loading"}
            className="w-full rounded-xl border border-paper-300 bg-white px-3 py-2.5 text-sm text-paper-900 outline-none placeholder:text-paper-400 focus:border-paper-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl border border-paper-900 bg-paper-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition hover:bg-paper-800 disabled:opacity-60"
          >
            {label}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-2 text-xs text-paper-700">{error}</p>
        )}
      </div>
    );
  }

  const wrapperClass =
    variant === "centered"
      ? "mx-auto mt-6 flex max-w-md items-center gap-2 rounded-full border border-paper-300 bg-white p-1"
      : "flex items-center gap-2 rounded-full border border-paper-300 bg-white p-1";

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
          className="flex-1 bg-transparent px-3 py-2 text-sm text-paper-900 outline-none placeholder:text-paper-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-paper-900 px-4 py-2 text-xs font-semibold text-paper-50 transition hover:bg-paper-800 disabled:opacity-60"
        >
          {label}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-paper-700">{error}</p>
      )}
    </div>
  );
}
