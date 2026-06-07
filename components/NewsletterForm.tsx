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
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 4000);
  };

  const wrapperClass =
    variant === "centered"
      ? "mx-auto mt-6 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1"
      : "flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1";

  return (
    <form onSubmit={onSubmit} className={wrapperClass} aria-label="Drop alerts signup">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-ink-50 outline-none placeholder:text-ink-400"
      />
      <button
        type="submit"
        className="rounded-full bg-signal-lime px-4 py-2 text-xs font-medium text-ink-950 transition hover:scale-[1.02]"
      >
        {done ? "On the list ✓" : buttonLabel}
      </button>
    </form>
  );
}
