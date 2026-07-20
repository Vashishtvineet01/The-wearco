import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-lime">
        // 404
      </div>
      <h1 className="mt-3 font-display text-4xl font-bold">Not found</h1>
      <p className="mt-3 text-ink-300">This page or product doesn&apos;t exist.</p>
      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Back to shop
      </Link>
    </div>
  );
}
