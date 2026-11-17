export default function Marquee({ items }: { items: string[] }) {
  // Duplicate so the loop seams are invisible.
  const all = [...items, ...items];
  // Rotate through aurora stops for the separators so the strip reads as a
  // sweep of colour, not a monotone ticker.
  const dotColors = [
    "text-signal-violet",
    "text-signal-coral",
    "text-signal-lime",
    "text-signal-sky",
    "text-signal-peach",
  ];
  const textColors = [
    "text-paper-900",
    "text-signal-violetInk",
    "text-paper-900",
    "text-signal-limeInk",
  ];

  return (
    <div className="relative overflow-hidden border-y border-paper-200 py-5 backdrop-blur">
      {/* Aurora wash behind the ticker so the strip visually anchors between sections. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(124,92,255,0.14) 0%, rgba(255,92,59,0.10) 35%, rgba(216,255,54,0.14) 65%, rgba(124,208,255,0.12) 100%)",
        }}
      />
      {/* Softer faded edges so the ticker dissolves into the page rather
          than hitting a hard border. */}
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
            <span
              className={`font-display text-2xl font-bold tracking-tight md:text-4xl ${
                textColors[i % textColors.length]
              }`}
            >
              {item}
            </span>
            <span
              className={`text-xl md:text-2xl ${dotColors[i % dotColors.length]}`}
            >
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
