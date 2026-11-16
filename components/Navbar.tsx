"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-paper-200"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl text-ink-950 shadow-[0_6px_24px_-6px_rgba(124,92,255,0.55)] transition-transform duration-300 group-hover:scale-105">
            <span className="absolute inset-0 bg-gradient-aurora" style={{ backgroundSize: "200% 200%" }} />
            <span className="absolute inset-0 bg-gradient-aurora opacity-0 transition-opacity duration-500 group-hover:opacity-100 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
            <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 7l9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
            </svg>
          </span>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight">TheWearCo</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
              Internet Uniform
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/studio" highlight>
            Design Studio
          </NavLink>
          <NavLink href="/bulk">Bulk</NavLink>
          <NavLink href="/about">Community</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="group hidden items-center gap-2 overflow-hidden rounded-full border border-paper-200 bg-paper-100/60 px-3.5 py-2 text-xs font-medium text-paper-900 transition md:inline-flex hover:border-paper-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-glow rounded-full bg-signal-lime" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-lime" />
            </span>
            <span className="transition-colors group-hover:text-signal-limeInkInk">
              Print your design
            </span>
          </Link>
          <Link href="/cart" className="btn-icon relative" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L22 7H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-aurora px-1 font-mono text-[10px] font-bold text-ink-950 shadow-[0_0_14px_rgba(255,92,59,0.6)]">
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
            <MobileLink onClick={() => setOpen(false)} href="/shop">Shop</MobileLink>
            <MobileLink onClick={() => setOpen(false)} href="/studio">Design Studio</MobileLink>
            <MobileLink onClick={() => setOpen(false)} href="/bulk">Bulk orders</MobileLink>
            <MobileLink onClick={() => setOpen(false)} href="/about">Community</MobileLink>
            <MobileLink onClick={() => setOpen(false)} href="/cart">Cart ({count})</MobileLink>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
  highlight
}: {
  href: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm transition ${
        highlight
          ? "text-signal-limeInk hover:bg-signal-lime/10"
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
  onClick
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="border-b border-paper-200 py-3 text-sm text-paper-800 last:border-b-0"
    >
      {children}
    </Link>
  );
}
