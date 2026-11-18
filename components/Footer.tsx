import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import { ANDROID_APP_URL } from "@/lib/android-app";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-paper-200 bg-paper-100/80">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-4 lg:gap-10 lg:px-8">
        <div>
          <div className="font-display text-2xl font-bold tracking-tight text-paper-900">
            TheWearCo
          </div>
          <p className="mt-2 max-w-xs text-sm text-paper-600">
            Internet uniform for founders, creators and builders. Wear what
            you&apos;re shipping.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper-300 bg-paper-50 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-paper-700" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-700">
              Drop 03 — Live
            </span>
          </div>
          <a
            href={ANDROID_APP_URL}
            download="thewearco-android.apk"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-paper-900 bg-paper-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition hover:bg-paper-800"
            aria-label="Download TheWearCo Android app"
          >
            <AndroidIcon />
            Download Android app
          </a>
          <p className="mt-2 max-w-xs text-[11px] text-paper-500">
            Direct APK install. Allow installs from this browser if Android asks.
          </p>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-500">
            Shop
          </div>
          <ul className="space-y-2 text-sm text-paper-800">
            <li>
              <Link href="/shop?cat=tee" className="transition hover:text-paper-900">
                Tees
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=hoodie" className="transition hover:text-paper-900">
                Hoodies
              </Link>
            </li>
            <li>
              <Link
                href="/shop?cat=sweatshirt"
                className="transition hover:text-paper-900"
              >
                Sweatshirts
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=cap" className="transition hover:text-paper-900">
                Caps
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=mug" className="transition hover:text-paper-900">
                Mugs
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=badge" className="transition hover:text-paper-900">
                Badges
              </Link>
            </li>
            <li>
              <Link href="/shop?cat=poster" className="transition hover:text-paper-900">
                Posters
              </Link>
            </li>
            <li>
              <Link href="/design?view=me" className="transition hover:text-paper-900">
                Print your own
              </Link>
            </li>
            <li>
              <Link href="/design?view=team" className="transition hover:text-paper-900">
                Bulk orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-500">
            Company
          </div>
          <ul className="space-y-2 text-sm text-paper-800">
            <li>
              <Link href="/about" className="transition hover:text-paper-900">
                Manifesto
              </Link>
            </li>
            <li>
              <Link href="/community" className="transition hover:text-paper-900">
                Community
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-paper-900">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/track" className="transition hover:text-paper-900">
                Track an order
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-paper-900">
                Your account
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-paper-900">
                Sign in
              </Link>
            </li>
            <li>
              <a
                href={ANDROID_APP_URL}
                download="thewearco-android.apk"
                className="transition hover:text-paper-900"
              >
                Android app
              </a>
            </li>
          </ul>
        </div>

        {/* Last column — soft cream panel, no red accents */}
        <div className="rounded-2xl border border-paper-200 bg-paper-50 p-5">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em] text-paper-500">
            Stay close
          </div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-paper-900">
            Early access to every drop.
          </h3>
          <p className="mt-2 text-sm text-paper-600">
            One email when a drop goes live. Plus office-hours invites — no spam.
          </p>
          <div className="mt-4">
            <NewsletterForm variant="stacked" buttonLabel="Join list" />
          </div>
          <Link
            href="/community"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-paper-700 transition hover:text-paper-900"
          >
            Explore the community
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="border-t border-paper-200">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-paper-500 md:flex-row md:items-center lg:px-8">
          <div>© {new Date().getFullYear()} TheWearCo. Made by builders.</div>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Policies">
            <Link href="/privacy" className="hover:text-paper-800">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-paper-800">
              Terms
            </Link>
            <Link href="/refund" className="hover:text-paper-800">
              Refunds
            </Link>
            <Link href="/shipping" className="hover:text-paper-800">
              Shipping
            </Link>
            <Link href="/contact" className="hover:text-paper-800">
              Contact
            </Link>
          </nav>
          <div className="font-mono uppercase tracking-[0.2em]">
            v1.0 / shipping daily
          </div>
        </div>
      </div>
    </footer>
  );
}

function AndroidIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.16 11.17 2.4 14.05 2.4 17.3v.6c0 .55.45 1 1 1h17.2c.55 0 1-.45 1-1v-.6c0-3.25-1.76-6.13-3.99-7.82zM7.5 15.3a1.1 1.1 0 110-2.2 1.1 1.1 0 010 2.2zm9 0a1.1 1.1 0 110-2.2 1.1 1.1 0 010 2.2z" />
    </svg>
  );
}
