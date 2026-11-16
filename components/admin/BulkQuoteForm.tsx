"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteBulkQuoteAction,
  updateBulkQuoteAction
} from "@/lib/admin-actions";

const STATUSES = ["new", "reviewing", "quoted", "won", "lost"] as const;

export default function BulkQuoteForm({
  id,
  status,
  adminNotes
}: {
  id: string;
  status: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(adminNotes || "");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const onSave = () => {
    start(async () => {
      await updateBulkQuoteAction(id, { status: currentStatus, adminNotes: notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  const onDelete = () => {
    if (!confirm("Delete this quote request?")) return;
    start(async () => {
      await deleteBulkQuoteAction(id);
      router.push("/admin/quotes");
      router.refresh();
    });
  };

  return (
    <div className="card space-y-3 p-5">
      <div>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
          Status
        </div>
        <select
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          className="w-full rounded-lg border border-paper-200 bg-paper-200 px-3 py-2 text-sm capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-paper-500">
          Internal notes
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Price confirmed, shipping to Bengaluru, needs invoice in company name…"
          className="h-28 w-full resize-none rounded-lg border border-paper-200 bg-paper-200 p-3 text-sm outline-none focus:border-signal-lime/40"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={pending}
          onClick={onSave}
        >
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
        <button
          type="button"
          className="btn-ghost text-signal-coral"
          disabled={pending}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
