export default function Marquee({ items }: { items: string[] }) {
  const all = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-ink-950 py-4">
      <div className="marquee-track gap-12 whitespace-nowrap">
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink-100 md:text-4xl">
              {item}
            </span>
            <span className="text-signal-lime">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
