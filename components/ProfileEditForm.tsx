"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Gender = "male" | "female" | "other" | "";

export default function ProfileEditForm({
  initialName,
  initialEmail,
  initialGender,
  phoneDisplay,
}: {
  initialName: string;
  initialEmail: string;
  initialGender: Gender;
  phoneDisplay: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [gender, setGender] = useState<Gender>(initialGender || "male");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, gender }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4">
      <div>
        <label className="text-xs font-medium text-paper-500">Full Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-paper-500">Mobile Number</label>
        <input
          type="text"
          readOnly
          value={phoneDisplay ? `+91 ${phoneDisplay}` : "—"}
          className={`${inputClass} cursor-default bg-paper-50`}
        />
      </div>
      <div>
        <label className="text-xs font-medium text-paper-500">Email ID</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: yourmailid@gmail.com"
          className={inputClass}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-paper-500">Gender</label>
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

      {error && <p className="text-sm text-[#c2410c]">{error}</p>}
      {saved && (
        <p className="text-sm text-[#15803d]">Profile updated.</p>
      )}

      <button
        type="submit"
        disabled={submitting || name.trim().length < 2}
        className="h-12 w-full rounded-lg bg-[#facc15] text-sm font-bold uppercase tracking-[0.06em] text-paper-900 transition hover:bg-[#f59e0b] disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1.5 h-12 w-full rounded-lg border border-paper-300 bg-white px-4 text-[15px] outline-none transition placeholder:text-paper-400 focus:border-paper-900";
