"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Pixel offset before triggering the reveal. Default 80px from bottom. */
  rootMargin?: string;
  /** Extra delay in ms once visible (useful for staggering). */
  delay?: number;
  className?: string;
  /** Tailwind utility for the hidden-state transform. Default: translate-y-4 */
  offsetClass?: string;
  as?: "div" | "section" | "article";
};

/**
 * Lightweight IntersectionObserver-powered fade-in-up wrapper.
 * No deps — uses CSS transition on opacity + translate.
 *
 * Respects `prefers-reduced-motion` via the global stylesheet rule which
 * collapses transition-duration to near-zero.
 */
export default function ScrollReveal({
  children,
  rootMargin = "0px 0px -80px 0px",
  delay = 0,
  className = "",
  offsetClass = "translate-y-4",
  as: Tag = "div"
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 ${offsetClass}`
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
