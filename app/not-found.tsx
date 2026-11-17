import Link from "next/link";
import Aurora from "@/components/Aurora";

export default function NotFound() {
  return (
    <div className="relative mx-auto max-w-2xl px-5 py-24 text-center lg:px-8 lg:py-32">
      <section className="spotlight-violet relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 px-6 py-16 md:px-10 md:py-20">
        <Aurora
          blobs={[
            {
              color: "violet",
              size: 360,
              top: "-120px",
              left: "-100px",
              opacity: 0.5,
            },
            {
              color: "coral",
              size: 300,
              top: "-40px",
              right: "-80px",
              delay: 3,
              opacity: 0.4,
            },
            {
              color: "lime",
              size: 240,
              bottom: "-100px",
              left: "30%",
              delay: 6,
              opacity: 0.35,
              slow: true,
            },
          ]}
        />
        <div className="relative">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl text-ink-950 shadow-[0_8px_28px_-8px_rgba(124,92,255,0.55)]">
            <span
              className="absolute inset-0 bg-gradient-aurora"
              style={{ backgroundSize: "200% 200%" }}
            />
            <svg
              viewBox="0 0 24 24"
              className="relative h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M3 7l9-5 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />
            </svg>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
            // 404
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            This drop doesn&apos;t{" "}
            <span className="gradient-text">exist.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-paper-700">
            The page you&apos;re looking for shipped elsewhere — or never
            launched. Head back to the shop or start a custom print.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/shop" className="btn-primary">
              Shop the drops
            </Link>
            <Link href="/" className="btn-ghost">
              Back home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
