import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";
import BulkQuoteForm from "@/components/admin/BulkQuoteForm";

export const dynamic = "force-dynamic";

export default async function AdminBulkQuoteDetailPage({
  params
}: {
  params: { id: string };
}) {
  const quote = await prisma.bulkQuote.findUnique({ where: { id: params.id } });
  if (!quote) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/quotes" className="text-xs text-ink-400 hover:text-ink-100">
            ← Bulk quotes
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {quote.name}
          </h1>
          <p className="mt-1 text-sm text-ink-300">
            {new Date(quote.createdAt).toLocaleString("en-IN")} ·{" "}
            <a href={`mailto:${quote.email}`} className="text-signal-lime">
              {quote.email}
            </a>
            {quote.phone ? (
              <>
                {" "}
                · <span className="font-mono">{quote.phone}</span>
              </>
            ) : null}
          </p>
          {quote.company && (
            <p className="mt-0.5 text-sm text-ink-400">{quote.company}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold">Request</h2>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <Row label="Product">
                {quote.productName || quote.productSlug || "—"}
                {quote.category && (
                  <span className="ml-1 font-mono text-[10px] uppercase text-ink-400">
                    · {quote.category}
                  </span>
                )}
              </Row>
              <Row label="Quantity">
                <span className="font-mono">{quote.qty}</span>
              </Row>
              <Row label="Color">{quote.color || "—"}</Row>
              <Row label="Size">{quote.size || "—"}</Row>
              <Row label="Print shape">{quote.printShape || "—"}</Row>
              <Row label="Deadline">
                {quote.deadline
                  ? new Date(quote.deadline).toLocaleDateString("en-IN")
                  : "—"}
              </Row>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                Brief
              </div>
              <p className="whitespace-pre-wrap text-sm text-ink-100">
                {quote.message}
              </p>
            </div>

            {quote.fileUrl && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
                  Artwork
                </div>
                <a
                  href={quote.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-signal-lime hover:underline"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 3h7v7" />
                    <path d="M10 14L21 3" />
                    <path d="M21 14v7H3V3h7" />
                  </svg>
                  Open attachment
                </a>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={quote.fileUrl}
                  alt="Attachment"
                  className="mt-3 max-h-64 rounded-lg border border-white/10 bg-ink-900 object-contain"
                />
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-display text-lg font-semibold">
              Customer&apos;s estimate
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Snapshot from the live calculator when they hit send. You can quote
              a different price by replying from your mailer.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric
                label="Unit"
                value={
                  quote.estimatedUnitPrice != null
                    ? formatINR(quote.estimatedUnitPrice)
                    : "—"
                }
              />
              <Metric
                label="Discount"
                value={
                  quote.tierDiscountPercent != null
                    ? `${quote.tierDiscountPercent}%`
                    : "—"
                }
                highlight={!!quote.tierDiscountPercent}
              />
              <Metric
                label="Total"
                value={
                  quote.estimatedTotal != null
                    ? formatINR(quote.estimatedTotal)
                    : "—"
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-1">
          <BulkQuoteForm
            id={quote.id}
            status={quote.status}
            adminNotes={quote.adminNotes}
          />
          <div className="card p-5">
            <h3 className="font-display text-sm font-semibold">Quick replies</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  className="text-signal-lime hover:underline"
                  href={`mailto:${quote.email}?subject=${encodeURIComponent(`Re: Your bulk enquiry · ${quote.productName || quote.productSlug || ""}`)}&body=${encodeURIComponent(
                    `Hi ${quote.name},\n\nThanks for reaching out about your bulk order. Confirming a few details:\n\n- Product: ${quote.productName || quote.productSlug || "(TBD)"}\n- Qty: ${quote.qty}\n- Deadline: ${quote.deadline ? new Date(quote.deadline).toLocaleDateString("en-IN") : "flexible"}\n\nQuoted total: ${
                      quote.estimatedTotal != null ? formatINR(quote.estimatedTotal) : "TBD"
                    }\n\nReply to confirm and we'll send a mockup for sign-off.\n\n— TheWearCo`
                  )}`}
                >
                  Email with quote draft
                </a>
              </li>
              <li>
                <a
                  className="text-ink-200 hover:text-ink-50"
                  href={`mailto:${quote.email}?subject=${encodeURIComponent("Quick question re: your TheWearCo bulk enquiry")}`}
                >
                  Email (blank)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/30 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
        {label}
      </div>
      <div className="mt-1 text-ink-100">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight = false
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-signal-lime/30 bg-signal-lime/5"
          : "border-white/10 bg-black/30"
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-lg font-bold ${
          highlight ? "text-signal-lime" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
