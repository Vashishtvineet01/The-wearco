export default function Marquee({ items }: { items: string[] }) {
  const all = [...items, ...items];
  const colors = ["text-signal-violet", "text-signal-coral", "text-signal-violet", "text-signal-sky"];
  return (
    <div className="relative overflow-hidden border-y border-paper-200 bg-paper-100/40 py-4 backdrop-blur">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper-50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper-50 to-transparent"
      />
      <div className="marquee-track gap-12 whitespace-nowrap">
        {all.map((item, i) => (
          <div key={i} className="flex items-center gap-12">
            <span className="font-display text-2xl font-semibold tracking-tight text-paper-800 md:text-4xl">
              {item}
            </span>
            <span className={`${colors[i % colors.length]} text-xl`}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
