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
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-signal-lime text-ink-950">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M3 7l9-5 9 5-9 5-9-5zm0 5l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </span>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight">TheWearCo</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-300">
              Internet Uniform
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/studio" highlight>
            Design Studio
          </NavLink>
          <NavLink href="/about">Community</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="hidden items-center gap-2 rounded-full border border-signal-lime/40 bg-signal-lime/10 px-3.5 py-2 text-xs font-medium text-signal-lime transition hover:bg-signal-lime/20 md:inline-flex"
          >
            <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-lime" />
            Print your design
          </Link>
          <Link href="/cart" className="btn-icon relative" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L22 7H6" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-signal-lime px-1 font-mono text-[10px] font-bold text-ink-950">
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
        <div className="border-t border-white/[0.06] bg-ink-950/95 backdrop-blur md:hidden">
          <div className="flex flex-col px-5 py-3">
            <MobileLink onClick={() => setOpen(false)} href="/shop">Shop</MobileLink>
            <MobileLink onClick={() => setOpen(false)} href="/studio">Design Studio</MobileLink>
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
          ? "text-signal-lime hover:bg-signal-lime/10"
          : "text-ink-100 hover:bg-white/[0.04]"
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
      className="border-b border-white/[0.04] py-3 text-sm text-ink-100 last:border-b-0"
    >
      {children}
    </Link>
  );
}
