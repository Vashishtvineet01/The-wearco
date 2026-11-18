"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop" },
  { href: "/design", label: "Design" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountLabel, setAccountLabel] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { label?: string | null; email?: string | null; phone?: string | null }) => {
        if (!cancelled) {
          setAccountLabel(d.label ?? d.email ?? d.phone ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setAccountLabel(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close mobile drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-paper-200"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={pathMatches(pathname, item.href)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {accountLabel ? (
            <Link
              href="/account"
              className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full text-sm font-bold text-[#fff8eb] shadow-[0_4px_16px_-4px_rgba(180,83,9,0.45)]"
              style={{
                background:
                  "linear-gradient(145deg, #f59e0b 0%, #b45309 100%)",
              }}
              aria-label={`Account · ${accountLabel}`}
              title={accountLabel}
            >
              <span className="relative uppercase">
                {accountLabel.charAt(0)}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-icon"
              aria-label="Sign in"
              title="Sign in"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0116 0" />
              </svg>
            </Link>
          )}
          <Link href="/cart" className="btn-icon relative" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L22 7H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal-coral px-1 font-mono text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            className="btn-icon md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-paper-200 bg-paper-50/95 backdrop-blur md:hidden">
          <div className="flex flex-col px-5 py-3">
            {NAV_ITEMS.map((item) => (
              <MobileLink
                key={item.href}
                onClick={() => setOpen(false)}
                href={item.href}
                active={pathMatches(pathname, item.href)}
              >
                {item.label}
              </MobileLink>
            ))}
            <MobileLink onClick={() => setOpen(false)} href="/cart">
              Cart ({count})
            </MobileLink>
            <MobileLink
              onClick={() => setOpen(false)}
              href={accountLabel ? "/account" : "/login"}
            >
              {accountLabel ? "Your account" : "Sign in"}
            </MobileLink>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-paper-200/80 text-paper-900"
          : "text-paper-800 hover:bg-paper-100/60"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  active,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`border-b border-paper-200 py-3 text-sm last:border-b-0 ${
        active ? "font-semibold text-paper-900" : "text-paper-800"
      }`}
    >
      {children}
    </Link>
  );
}
