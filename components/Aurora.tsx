import type { CSSProperties } from "react";

type Blob = {
  color: "violet" | "coral" | "lime" | "sky" | "peach" | "mint";
  size: number; // in px
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** Delay in seconds to stagger the drift animation across blobs. */
  delay?: number;
  opacity?: number;
  /** When true, use the slower 36s drift variant. */
  slow?: boolean;
};

type Props = {
  blobs?: Blob[];
  className?: string;
};

/**
 * Soft, slow-drifting aurora blobs for section backgrounds.
 * Purely decorative — pointer-events disabled, rendered beneath content.
 *
 * Usage:
 * <section className="relative overflow-hidden">
 *   <Aurora />
 *   <YourContent />
 * </section>
 */
const DEFAULT_BLOBS: Blob[] = [
  { color: "violet", size: 520, top: "-180px", left: "-120px", delay: 0 },
  { color: "coral", size: 440, top: "-80px", right: "-100px", delay: 5, slow: true },
  { color: "lime", size: 360, bottom: "-160px", left: "30%", delay: 2, opacity: 0.35 }
];

export default function Aurora({ blobs = DEFAULT_BLOBS, className = "" }: Props) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {blobs.map((b, i) => {
        const style: CSSProperties = {
          width: b.size,
          height: b.size,
          top: b.top,
          left: b.left,
          right: b.right,
          bottom: b.bottom,
          opacity: b.opacity ?? 0.5,
          animationDelay: b.delay ? `${b.delay}s` : undefined
        };
        return (
          <div
            key={i}
            style={style}
            className={`aurora-blob aurora-blob--${b.color} ${
              b.slow ? "animate-drift-slow" : "animate-drift"
            }`}
          />
        );
      })}
    </div>
  );
}
