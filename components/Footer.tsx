import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-2xl font-bold tracking-tight">TheWearCo</div>
          <p className="mt-2 max-w-xs text-sm text-ink-300">
            Internet uniform for founders, creators and builders. Wear what you’re shipping.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <span className="tag">
              <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-lime" />
              Drop 03 — Live
            </span>
          </div>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
            Shop
          </div>
          <ul className="space-y-2 text-sm text-ink-100">
            <li><Link href="/shop?cat=tee">Tees</Link></li>
            <li><Link href="/shop?cat=hoodie">Hoodies</Link></li>
            <li><Link href="/shop?cat=cap">Caps</Link></li>
            <li><Link href="/studio">Print your own</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
            Company
          </div>
          <ul className="space-y-2 text-sm text-ink-100">
            <li><Link href="/about">Manifesto</Link></li>
            <li><Link href="/about#community">Community</Link></li>
            <li><a href="mailto:hi@thewearco.com">Contact</a></li>
            <li><Link href="/about#shipping">Shipping & returns</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink-300">
            Drop alerts
          </div>
          <p className="mb-3 text-sm text-ink-300">
            New drops + community invites. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-ink-400 md:flex-row md:items-center lg:px-8">
          <div>© {new Date().getFullYear()} TheWearCo. Made by builders.</div>
          <div className="font-mono uppercase tracking-[0.2em]">
            v1.0 / shipping daily
          </div>
        </div>
      </div>
    </footer>
  );
}
