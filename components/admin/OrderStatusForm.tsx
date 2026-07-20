"use client";

import { useTransition } from "react";
import { updateOrderStatusAction } from "@/lib/admin-actions";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export default function OrderStatusForm({
  id,
  status
}: {
  id: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
        const value = e.target.value;
        start(() => {
          void updateOrderStatusAction(id, value);
        });
      }}
        className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => window.print()}
      >
        Print
      </button>
    </div>
  );
}
