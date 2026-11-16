import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8 lg:py-24">
      <div className="mb-12">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          // Manifesto
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Clothing for the people <br />
          <span className="text-signal-limeInk">building it themselves.</span>
        </h1>
      </div>

      <div className="prose-styles space-y-6 text-lg leading-relaxed text-paper-700">
        <p>
          TheWearCo is not a fashion brand. It’s an{" "}
          <span className="text-paper-900">internet uniform</span> — quiet,
          identity-first clothing for founders, creators, freelancers and the
          terminally online.
        </p>
        <p>
          We design slowly, drop in small batches, and embed culture into every
          piece — from a chest typeline to a hidden QR on a sleeve that
          unlocks a private community.
        </p>
        <p>
          And if our drops don’t say what you’re trying to say, you can{" "}
          <Link href="/design" className="text-signal-limeInk underline-offset-4 hover:underline">
            print your own
          </Link>
          . That’s the whole point.
        </p>
      </div>

      <div className="mt-14 rounded-2xl border border-paper-200 bg-paper-100/50 p-6 md:p-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          // Members-only layer
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
          Every piece is a key.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-paper-700 md:text-base">
          Hidden QR on every hoodie, cap and badge. Scan it to unlock the
          founder Discord, monthly office hours and early access to every drop.
        </p>
        <div className="mt-5">
          <Link href="/community" className="btn-ghost">
            See how the community works →
          </Link>
        </div>
      </div>

      <div className="mt-16" id="shipping">
        <h2 className="font-display text-2xl font-bold">Shipping & returns</h2>
        <ul className="mt-4 space-y-3 text-sm text-paper-700">
          <li>• Free shipping above ₹1,499 across India.</li>
          <li>• Standard delivery: 48 hours metro, 3–5 days elsewhere.</li>
          <li>• Custom prints (Design Studio): 5–7 working days.</li>
          <li>• 7-day easy exchange on standard drops. Custom pieces are non-refundable.</li>
        </ul>
      </div>

      <div className="mt-20">
        <div className="card overflow-hidden p-8 text-center md:p-14">
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
            // Drop alerts
          </div>
          <h3 className="mt-3 font-display text-3xl font-bold tracking-tight">
            Be the first to wear it.
          </h3>
          <p className="mt-3 text-paper-600">No spam. New drops + community invites only.</p>
          <NewsletterForm variant="centered" buttonLabel="Join" />
        </div>
      </div>
    </div>
  );
}
