"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/lib/admin-actions";

export default function SettingsPageClient({ email }: { email: string }) {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink-300">Admin account</p>

      <div className="card mt-8 max-w-lg space-y-4 p-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            Signed in as
          </div>
          <div className="mt-1">{email}</div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            Database
          </div>
          <div className="mt-1 font-mono text-xs text-ink-300">SQLite · prisma/dev.db</div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h2 className="font-display text-lg font-semibold">Change password</h2>
          <label className="mt-3 block">
            <div className="mb-1 text-xs text-ink-300">Current password</div>
            <input
              type="password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </label>
          <label className="mt-3 block">
            <div className="mb-1 text-xs text-ink-300">New password</div>
            <input
              type="password"
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
            />
          </label>
          {err && <p className="mt-2 text-xs text-signal-coral">{err}</p>}
          {msg && <p className="mt-2 text-xs text-signal-lime">{msg}</p>}
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={pending}
            onClick={() => {
              setErr("");
              setMsg("");
              start(async () => {
                const res = await changePasswordAction({ currentPassword, newPassword });
                if (res?.error) setErr(res.error);
                else {
                  setMsg("Password updated");
                  setCurrent("");
                  setNew("");
                }
              });
            }}
          >
            {pending ? "Saving…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}
