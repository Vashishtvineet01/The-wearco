"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

type RevealVariant = "up" | "fade" | "scale";

type Props = {
  children: ReactNode;
  /** Pixel offset before triggering the reveal. Default 80px from bottom. */
  rootMargin?: string;
  /** Extra delay in ms once visible (useful for staggering). */
  delay?: number;
  className?: string;
  /** Tailwind utility for the hidden-state transform. Default: translate-y-4 */
  offsetClass?: string;
  /** Reveal motion style. Default: up */
  variant?: RevealVariant;
  as?: "div" | "section" | "article";
};

const HIDDEN: Record<RevealVariant, string> = {
  up: "opacity-0 translate-y-4",
  fade: "opacity-0",
  scale: "opacity-0 scale-[0.98]",
};

const VISIBLE: Record<RevealVariant, string> = {
  up: "opacity-100 translate-y-0",
  fade: "opacity-100",
  scale: "opacity-100 scale-100",
};

/**
 * Lightweight IntersectionObserver-powered reveal wrapper.
 * No deps — uses CSS transition on opacity + transform.
 *
 * Respects `prefers-reduced-motion` via the global stylesheet rule which
 * collapses transition-duration to near-zero.
 */
export default function ScrollReveal({
  children,
  rootMargin = "0px 0px -80px 0px",
  delay = 0,
  className = "",
  offsetClass,
  variant = "up",
  as: Tag = "div",
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
      { rootMargin, threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  const hidden =
    variant === "up" && offsetClass
      ? `opacity-0 ${offsetClass}`
      : HIDDEN[variant];

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? VISIBLE[variant] : hidden
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

type StaggerProps = {
  children: ReactNode;
  /** Base delay between children in ms. Default 70. */
  step?: number;
  /** Starting delay for the first child. Default 0. */
  start?: number;
  className?: string;
  variant?: RevealVariant;
};

/**
 * Cascades ScrollReveal across direct children by injecting increasing delays.
 * Children that are already ScrollReveal keep their props and get delay merged.
 */
export function RevealStagger({
  children,
  step = 70,
  start = 0,
  className = "",
  variant = "up",
}: StaggerProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) {
          return (
            <ScrollReveal delay={start + i * step} variant={variant}>
              {child}
            </ScrollReveal>
          );
        }

        const el = child as ReactElement<{ delay?: number; variant?: RevealVariant }>;
        if (el.type === ScrollReveal) {
          return cloneElement(el, {
            delay: el.props.delay ?? start + i * step,
            variant: el.props.variant ?? variant,
          });
        }

        return (
          <ScrollReveal delay={start + i * step} variant={variant}>
            {child}
          </ScrollReveal>
        );
      })}
    </div>
  );
}
