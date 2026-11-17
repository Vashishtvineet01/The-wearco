import type { ReactNode } from "react";
import Aurora from "@/components/Aurora";

type Spotlight = "violet" | "sunrise" | "ocean" | "lime";

type BlobColor = "violet" | "coral" | "lime" | "sky" | "peach" | "mint";

const SPOTLIGHT: Record<Spotlight, string> = {
  violet: "spotlight-violet",
  sunrise: "spotlight-sunrise",
  ocean: "spotlight-ocean",
  lime: "spotlight-lime",
};

const BLOBS: Record<
  Spotlight,
  { color: BlobColor; size: number; top?: string; left?: string; right?: string; bottom?: string; delay?: number; opacity?: number; slow?: boolean }[]
> = {
  violet: [
    { color: "violet", size: 380, top: "-120px", left: "-100px", opacity: 0.5 },
    { color: "coral", size: 320, top: "-60px", right: "-70px", delay: 3, opacity: 0.4 },
    { color: "lime", size: 260, bottom: "-120px", left: "25%", delay: 6, opacity: 0.35, slow: true },
  ],
  sunrise: [
    { color: "coral", size: 400, top: "-140px", left: "-100px", opacity: 0.48 },
    { color: "peach", size: 340, top: "-60px", right: "-80px", delay: 3, opacity: 0.4 },
    { color: "violet", size: 280, bottom: "-120px", right: "30%", delay: 6, opacity: 0.35, slow: true },
  ],
  ocean: [
    { color: "violet", size: 380, top: "-120px", left: "-100px", opacity: 0.48 },
    { color: "sky", size: 340, top: "-60px", right: "-80px", delay: 3, opacity: 0.4 },
    { color: "lime", size: 280, bottom: "-140px", left: "30%", delay: 6, opacity: 0.35, slow: true },
  ],
  lime: [
    { color: "lime", size: 380, top: "-120px", left: "-80px", opacity: 0.45 },
    { color: "violet", size: 320, top: "-40px", right: "-70px", delay: 3, opacity: 0.4 },
    { color: "sky", size: 260, bottom: "-120px", left: "28%", delay: 6, opacity: 0.32, slow: true },
  ],
};

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra content under the subtitle (CTAs, etc.) */
  children?: ReactNode;
  spotlight?: Spotlight;
  /** Center-align text (default left). */
  center?: boolean;
  className?: string;
  /** Smaller padding for compact utility pages. */
  compact?: boolean;
};

/**
 * Shared aurora hero card used across Shop, legal, track, cart empty, etc.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  spotlight = "violet",
  center = false,
  className = "",
  compact = false,
}: Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-paper-200 bg-paper-50/40 ${SPOTLIGHT[spotlight]} ${
        compact ? "px-6 py-10 md:px-10 md:py-12" : "px-6 py-12 md:px-10 md:py-16"
      } ${className}`}
    >
      <Aurora blobs={BLOBS[spotlight]} />
      <span
        aria-hidden
        className="pointer-events-none absolute left-[7%] top-[18%] text-2xl text-signal-violet/55 animate-float"
      >
        ✦
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute right-[11%] top-[30%] text-xl text-signal-coral/60 animate-float"
        style={{ animationDelay: "900ms" }}
      >
        ✦
      </span>
      <div className={`relative ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-limeInk">
          // {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-3 text-paper-700 ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}>
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
