import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  /** Kept for call-site compatibility; ignored. */
  spotlight?: "violet" | "sunrise" | "ocean" | "lime";
  center?: boolean;
  className?: string;
  compact?: boolean;
};

/**
 * Open page hero — sits on the cream page, no white card/box.
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
      className={`relative ${
        compact ? "pb-8 pt-2 md:pb-10" : "pb-10 pt-2 md:pb-14"
      } ${className}`}
    >
      <div className={`relative ${center ? "mx-auto max-w-3xl text-center" : ""}`}>
        <div
          className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}
        >
          <span
            aria-hidden
            className={`h-px w-8 bg-paper-400 ${center ? "" : "hidden sm:block"}`}
          />
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
            {eyebrow}
          </div>
          <span
            aria-hidden
            className={`h-px w-8 bg-paper-400 ${center ? "" : "hidden"}`}
          />
        </div>

        <h1
          className={`mt-5 font-display font-bold tracking-tight text-paper-900 ${
            compact
              ? "text-3xl md:text-4xl"
              : "text-4xl leading-[1.05] md:text-6xl"
          }`}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={`mt-5 text-base leading-relaxed text-paper-600 md:text-lg ${
              center ? "mx-auto max-w-xl" : "max-w-xl"
            }`}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>

      <div
        aria-hidden
        className={`mt-10 h-px w-full bg-paper-200 ${center ? "mx-auto max-w-md" : "max-w-3xl"}`}
      />
    </section>
  );
}
