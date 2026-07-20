"use client";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal-coral">
        // Error
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold">Something broke.</h1>
      <p className="mt-3 text-sm text-ink-300">{error.message || "Unexpected error"}</p>
      <button type="button" onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </div>
  );
}
