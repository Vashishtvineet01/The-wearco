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
          ? "bg-signal-lime/15 text-signal-limeInk"
          : "bg-paper-100 text-paper-500"
      }`}
    >
      {active ? "Live" : "Hidden"}
    </button>
  );
}
