"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/uploads", label: "Uploads" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminShell({
  children,
  email
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/[0.06] bg-ink-900/50 lg:border-b-0 lg:border-r">
        <div className="px-5 py-5">
          <Link href="/admin" className="font-display text-lg font-bold">
            TheWearCo
          </Link>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
            Admin console
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {LINKS.map((l) => {
            const active =
              l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm whitespace-nowrap transition ${
                  active
                    ? "bg-signal-lime/10 text-signal-lime"
                    : "text-ink-200 hover:bg-white/[0.04] hover:text-ink-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-white/[0.06] px-5 py-4 lg:block">
          <div className="truncate text-xs text-ink-400">{email}</div>
          <button
            type="button"
            onClick={logout}
            className="mt-2 text-xs text-ink-300 hover:text-signal-coral"
          >
            Sign out
          </button>
          <Link href="/" className="mt-3 block text-xs text-signal-lime">
            ← View store
          </Link>
        </div>
      </aside>
      <main className="px-5 py-8 lg:px-10">{children}</main>
    </div>
  );
}
