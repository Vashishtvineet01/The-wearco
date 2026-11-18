export default function Marquee({ items }: { items: string[] }) {
  // Duplicate so the loop seams are invisible.
  const all = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-paper-200 bg-white/50 py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-paper-50 via-paper-50/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-paper-50 via-paper-50/80 to-transparent"
      />

      <div className="marquee-track relative gap-14 whitespace-nowrap">
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-14">
            <span className="font-display text-2xl font-bold tracking-tight text-paper-900 md:text-4xl">
              {item}
            </span>
            <span className="text-xl text-signal-coral md:text-2xl">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
