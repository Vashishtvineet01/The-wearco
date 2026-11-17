"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — even on failure we just push home
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <button onClick={onClick} className="btn-ghost" disabled={busy}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
