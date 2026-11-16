import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-paper-200">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-signal-violet/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-10 h-[260px] w-[260px] rounded-full bg-signal-coral/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-2xl font-bold tracking-tight">
            The<span className="gradient-text">Wear</span>Co
          </div>
          <p className="mt-2 max-w-xs text-sm text-paper-600">
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
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
            Shop
          </div>
          <ul className="space-y-2 text-sm text-paper-800">
            <li><Link href="/shop?cat=tee">Tees</Link></li>
            <li><Link href="/shop?cat=hoodie">Hoodies</Link></li>
            <li><Link href="/shop?cat=sweatshirt">Sweatshirts</Link></li>
            <li><Link href="/shop?cat=cap">Caps</Link></li>
            <li><Link href="/shop?cat=mug">Mugs</Link></li>
            <li><Link href="/shop?cat=badge">Badges</Link></li>
            <li><Link href="/shop?cat=poster">Posters</Link></li>
            <li><Link href="/design?view=me">Print your own</Link></li>
            <li><Link href="/design?view=team">Bulk orders</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
            Company
          </div>
          <ul className="space-y-2 text-sm text-paper-800">
            <li><Link href="/about">Manifesto</Link></li>
            <li><Link href="/community">Community</Link></li>
            <li><a href="mailto:hi@thewearco.com">Contact</a></li>
            <li><Link href="/about#shipping">Shipping & returns</Link></li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-600">
            Drop alerts
          </div>
          <p className="mb-3 text-sm text-paper-600">
            New drops + community invites. No spam, ever.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-paper-200">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-paper-500 md:flex-row md:items-center lg:px-8">
          <div>© {new Date().getFullYear()} TheWearCo. Made by builders.</div>
          <div className="font-mono uppercase tracking-[0.2em]">
            v1.0 / shipping daily
          </div>
        </div>
      </div>
    </footer>
  );
}
