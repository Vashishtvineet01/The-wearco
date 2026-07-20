"use client";

import { useTransition } from "react";
import { toggleProductActiveAction } from "@/lib/admin-actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(() => {
          void toggleProductActiveAction(id, !active);
        })
      }
      className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
        active
          ? "bg-signal-lime/15 text-signal-lime"
          : "bg-white/5 text-ink-400"
      }`}
    >
      {active ? "Live" : "Hidden"}
    </button>
  );
}
