"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV: {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
}[] = [
  { href: "/account", label: "Overview", icon: "overview", exact: true },
  { href: "/account/orders", label: "My Orders", icon: "orders" },
  { href: "/account/payments", label: "My Payments", icon: "payments" },
  { href: "/account/wallet", label: "My Wallet", icon: "wallet" },
  { href: "/account/addresses", label: "My Addresses", icon: "addresses" },
  { href: "/account/profile", label: "My Profile", icon: "profile" },
];

export default function AccountShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/account";
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#fafafa]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8 lg:py-10">
        <aside className="h-fit overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
          <nav className="flex flex-col">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 border-b border-[#f0f0f0] px-4 py-3.5 text-sm transition last:border-b-0 ${
                    active
                      ? "border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb] font-semibold text-paper-900"
                      : "border-l-[3px] border-l-transparent text-paper-700 hover:bg-paper-50"
                  }`}
                >
                  <NavIcon name={item.icon} active={active} />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="flex items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold text-[#dc2626] transition hover:bg-red-50 disabled:opacity-60"
            >
              <LogoutIcon />
              {signingOut ? "Logging out…" : "Logout"}
            </button>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function NavIcon({ name, active }: { name: string; active?: boolean }) {
  const cls = `h-[18px] w-[18px] shrink-0 ${active ? "text-[#b45309]" : "text-paper-500"}`;
  switch (name) {
    case "overview":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "orders":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="M3.3 7 12 12l8.7-5M12 22V12" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 0 4H5" />
          <path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "addresses":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
    default:
      return null;
  }
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
