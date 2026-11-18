import Link from "next/link";

type Props = {
  /** Pass `null` to render without a link wrapper. */
  href?: string | null;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** Cream wordmark for use on amber / dark panels */
  onDark?: boolean;
  className?: string;
};

/**
 * Warm brand mark — amber / clay / espresso (no flat black tile).
 * Stacked “layers” read as drops + uniform, with a soft cream W cut.
 */
export default function BrandLogo({
  href = "/",
  size = "md",
  showWordmark = true,
  onDark = false,
  className = "",
}: Props) {
  const mark =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon =
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const title =
    size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg";

  const theCo = onDark ? "text-[#fff8eb]" : "text-paper-900";
  const wear = onDark ? "text-[#fde68a]" : "text-[#b45309]";
  const tag = onDark ? "text-[#fff8eb]/65" : "text-paper-500";

  const inner = (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative grid ${mark} place-items-center overflow-hidden rounded-xl shadow-[0_8px_22px_-10px_rgba(180,83,9,0.55)] transition-transform duration-300 group-hover:scale-105`}
        aria-hidden
      >
        <span
          className="absolute inset-0"
          style={{
            background: onDark
              ? "linear-gradient(145deg, #fde68a 0%, #f59e0b 55%, #d97706 100%)"
              : "linear-gradient(145deg, #f59e0b 0%, #d97706 42%, #b45309 78%, #7c2d12 100%)",
          }}
        />
        <span
          className="absolute -right-3 -top-3 h-10 w-10 rounded-full opacity-40 blur-md"
          style={{ background: "#fde68a" }}
        />
        <svg
          viewBox="0 0 24 24"
          className={`relative ${icon} ${onDark ? "text-[#7c2d12]" : "text-[#fff8eb]"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
          <path d="M4 12.5 12 17l8-4.5" opacity="0.85" />
          <path d="M4 16 12 20.5 20 16" opacity="0.65" />
        </svg>
      </span>

      {showWordmark && (
        <span className="leading-none">
          <span className={`block font-display font-bold tracking-tight ${title}`}>
            <span className={theCo}>The</span>
            <span className={wear}>Wear</span>
            <span className={theCo}>Co</span>
          </span>
          <span
            className={`mt-0.5 block font-mono text-[10px] uppercase tracking-[0.22em] ${tag}`}
          >
            Internet Uniform
          </span>
        </span>
      )}
    </span>
  );

  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex" aria-label="TheWearCo home">
      {inner}
    </Link>
  );
}
