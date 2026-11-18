/**
 * Full-page brand loader used by Next.js Suspense / `loading.tsx` boundaries.
 *
 * Replaces the static "Fetching…" text with a proper animated sequence:
 *  - A spinning aurora ring with a soft glow
 *  - Three floating ✦ sparkles
 *  - Animated eyebrow with a blinking lime dot
 *  - Headline with 5-stop gradient shift
 *  - Three skeleton product tiles that shimmer while the real data loads
 *
 * Everything is pure CSS — no client JS, so it renders instantly on the
 * server-rendered fallback (which is the whole point of `loading.tsx`).
 */
export default function BrandLoader({
  eyebrow = "Loading",
  title = "Spinning up your canvas.",
  showTiles = true,
}: {
  eyebrow?: string;
  title?: string;
  showTiles?: boolean;
}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-5 py-20 text-center lg:px-8 lg:py-28">
      {/* Spinning coral ring */}
      <div className="relative mb-8 h-20 w-20">
        <span
          aria-hidden
          className="absolute inset-[-16px] rounded-full bg-signal-coral/25 blur-2xl"
        />
        <span
          aria-hidden
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-signal-coral/20 border-t-signal-coral"
          style={{ animationDuration: "1.1s" }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full bg-signal-coral"
        />
      </div>

      {/* Floating ✦ sparkles around the headline. */}
      <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2">
        <span
          aria-hidden
          className="absolute -left-40 -top-6 animate-float text-2xl text-signal-violet/60"
        >
          ✦
        </span>
        <span
          aria-hidden
          className="absolute left-36 -top-10 animate-float text-xl text-signal-coral/60"
          style={{ animationDelay: "800ms" }}
        >
          ✦
        </span>
        <span
          aria-hidden
          className="absolute -left-16 top-4 animate-float text-lg text-signal-limeInk/70"
          style={{ animationDelay: "1600ms" }}
        >
          ✦
        </span>
      </div>

      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
        <span className="h-1.5 w-1.5 animate-glow rounded-full bg-signal-coral" />
        // {eyebrow}
      </div>

      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper-900 md:text-4xl">
        {title}
      </h2>

      {/* Subtle secondary line so there's visible motion while we wait. */}
      <div className="mt-3 flex items-center justify-center gap-1 text-sm text-paper-600">
        <span>almost there</span>
        <span
          className="inline-flex gap-[2px]"
          aria-hidden
          style={{ marginLeft: "4px" }}
        >
          <Dot delay={0} />
          <Dot delay={180} />
          <Dot delay={360} />
        </span>
      </div>

      {/* Three shimmer skeleton tiles so the page retains its visual rhythm. */}
      {showTiles && (
        <div className="mt-12 grid w-full gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonTile key={i} delay={i * 180} />
          ))}
        </div>
      )}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1 w-1 animate-glow rounded-full bg-signal-coral"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function SkeletonTile({ delay }: { delay: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-paper-200 bg-paper-100/60 p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Tag placeholder. */}
      <div className="mb-3 flex items-start justify-between">
        <div className="h-5 w-16 rounded-full bg-paper-200" />
        <div className="h-5 w-14 rounded-full bg-paper-200" />
      </div>
      {/* Mockup placeholder with shimmer sweep. */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-paper-200">
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
            animation: `shimmer-sweep 1.8s ease-in-out ${delay}ms infinite`,
          }}
        />
      </div>
      {/* Two text lines. */}
      <div className="mt-4 h-3 w-3/4 rounded-full bg-paper-200" />
      <div className="mt-2 h-3 w-1/2 rounded-full bg-paper-200" />
    </div>
  );
}
