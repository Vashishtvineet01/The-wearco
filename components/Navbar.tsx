"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";
import { useCallback, useEffect, useRef, useState } from "react";
import BrandLogo from "./BrandLogo";

const NAV_ITEMS = [
  { href: "/shop", label: "Shop" },
  { href: "/design", label: "Design" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

type AuthUser = {
  loggedIn: boolean;
  label: string | null;
  initials: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
};

function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);
  const prevCount = useRef(count);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const refreshAuth = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: AuthUser) => {
        if (d?.loggedIn && d.label) {
          setUser(d);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > prevCount.current) {
      setBadgeKey((k) => k + 1);
    }
    prevCount.current = count;
  }, [count]);

  // Re-check session on every route change (login → account, etc.).
  useEffect(() => {
    refreshAuth();
  }, [pathname, refreshAuth]);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // still clear local UI
    } finally {
      setUser(null);
      setMenuOpen(false);
      setOpen(false);
      setSigningOut(false);
      router.push("/");
      router.refresh();
    }
  };

  const loggedIn = Boolean(user?.loggedIn && user.label);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "relative glass border-b border-paper-200"
          : "relative border-b border-transparent bg-transparent"
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          {loggedIn ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="btn-icon"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border border-paper-200 bg-white py-2 shadow-[0_12px_32px_-12px_rgba(20,17,14,0.35)]"
                >
                  <div className="px-4 py-2 text-sm italic text-paper-800">
                    Hi , {user!.label}
                  </div>
                  <Link
                    href="/account"
                    role="menuitem"
                    className="block px-4 py-2 text-sm italic text-paper-800 hover:bg-paper-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/wishlist"
                    role="menuitem"
                    className="block px-4 py-2 text-sm italic text-paper-800 hover:bg-paper-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Wishlist
                  </Link>
                  <Link
                    href="/account/orders"
                    role="menuitem"
                    className="block px-4 py-2 text-sm italic text-paper-800 hover:bg-paper-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/account/wallet"
                    role="menuitem"
                    className="block px-4 py-2 text-sm italic text-paper-800 hover:bg-paper-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Wallet
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    disabled={signingOut}
                    className="block w-full px-4 py-2 text-left text-sm italic text-paper-800 hover:bg-paper-50 disabled:opacity-60"
                  >
                    {signingOut ? "Logging out…" : "Logout"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden px-2 py-2 text-xs font-bold uppercase tracking-[0.12em] text-paper-900 transition hover:text-[#b45309] md:inline-flex"
            >
              Login
            </Link>
          )}

          <Link href="/wishlist" className="btn-icon relative" aria-label="Wishlist">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20.8 5.6a4.6 4.6 0 0 0-6.5 0L12 7.9l-2.3-2.3a4.6 4.6 0 1 0-6.5 6.5l2.3 2.3L12 21l6.5-6.6 2.3-2.3a4.6 4.6 0 0 0 0-6.5Z" />
            </svg>
            {wishCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#b45309] px-1 font-mono text-[10px] font-bold text-white">
                {wishCount}
              </span>
            )}
          </Link>

          <Link href="/cart" className="btn-icon relative" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h12l1 14H5L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && (
              <span
                key={badgeKey}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 animate-badge-pop place-items-center rounded-full bg-[#b45309] px-1 font-mono text-[10px] font-bold text-white"
              >
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

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#b45309]/90 transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />

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
            {loggedIn ? (
              <>
                <div className="border-b border-paper-200 py-3 text-sm italic text-paper-800">
                  Hi , {user!.label}
                </div>
                <MobileLink onClick={() => setOpen(false)} href="/account">
                  My Account
                </MobileLink>
                <MobileLink onClick={() => setOpen(false)} href="/wishlist">
                  My Wishlist
                </MobileLink>
                <MobileLink onClick={() => setOpen(false)} href="/account/orders">
                  My Orders
                </MobileLink>
                <MobileLink onClick={() => setOpen(false)} href="/account/wallet">
                  My Wallet
                </MobileLink>
                <button
                  type="button"
                  onClick={signOut}
                  disabled={signingOut}
                  className="border-b border-paper-200 py-3 text-left text-sm italic text-paper-800 last:border-b-0 disabled:opacity-60"
                >
                  {signingOut ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <MobileLink onClick={() => setOpen(false)} href="/login">
                Login
              </MobileLink>
            )}
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
