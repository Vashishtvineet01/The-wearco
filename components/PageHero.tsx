import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Kept for call-site compatibility; ignored (no mesh gradients). */
  spotlight?: "violet" | "sunrise" | "ocean" | "lime";
  center?: boolean;
  className?: string;
  compact?: boolean;
};

/**
 * Flat cream hero — no aurora blobs, no mesh gradient washes.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  center = false,
  className = "",
  compact = false,
}: Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-paper-200 bg-white ${
        compact ? "px-6 py-10 md:px-10 md:py-12" : "px-6 py-12 md:px-10 md:py-16"
      } ${className}`}
    >
      <div className={`relative ${center ? "mx-auto max-w-2xl text-center" : ""}`}>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
          // {eyebrow}
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-paper-900 md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p
            className={`mt-3 text-paper-700 ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
