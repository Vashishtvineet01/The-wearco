export default function Marquee({ items }: { items: string[] }) {
  // Two identical halves — animation translates -50% for a seamless loop.
  const sequence = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-paper-300/80 bg-paper-100 py-6 md:py-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(90deg, rgba(180,83,9,0.06) 0%, transparent 22%, transparent 78%, rgba(180,83,9,0.06) 100%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-paper-100 via-paper-100/80 to-transparent sm:w-28"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-paper-100 via-paper-100/80 to-transparent sm:w-28"
      />

      <div className="marquee-track relative">
        <MarqueeHalf items={sequence} />
        <MarqueeHalf items={sequence} ariaHidden />
      </div>
    </div>
  );
}

function MarqueeHalf({
  items,
  ariaHidden,
}: {
  items: string[];
  ariaHidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-10 whitespace-nowrap px-5 md:gap-14 md:px-7"
      aria-hidden={ariaHidden || undefined}
    >
      {items.map((item, i) => {
        const accent = i % 3 === 1;
        return (
          <div key={`${item}-${i}`} className="flex items-center gap-10 md:gap-14">
            <span
              className={`font-display text-2xl font-bold tracking-tight md:text-4xl ${
                accent ? "text-[#b45309]" : "text-paper-900"
              }`}
            >
              {item}
            </span>
            <span
              aria-hidden
              className="inline-flex h-2 w-2 shrink-0 rotate-45 animate-diamond-pulse bg-[#d97706]/80 md:h-2.5 md:w-2.5"
              style={{ animationDelay: `${(i % 5) * 0.35}s` }}
            />
          </div>
        );
      })}
    </div>
  );
}
