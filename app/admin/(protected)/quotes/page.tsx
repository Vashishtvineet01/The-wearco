import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status || "all";
  const q = (searchParams.q || "").trim();

  const quotes = await prisma.bulkQuote.findMany({
    where: {
      AND: [
        status !== "all" ? { status } : {},
        q
          ? {
              OR: [
                { email: { contains: q } },
                { name: { contains: q } },
                { company: { contains: q } },
                { productSlug: { contains: q } }
              ]
            }
          : {}
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  const statuses = ["all", "new", "reviewing", "quoted", "won", "lost"];
  const countNew = await prisma.bulkQuote.count({ where: { status: "new" } });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Bulk quotes</h1>
          <p className="mt-1 text-sm text-paper-600">
            {quotes.length} shown · {countNew} new
          </p>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-paper-200 bg-paper-200 px-3 py-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search email / name / company"
          className="min-w-[200px] flex-1 rounded-lg border border-paper-200 bg-paper-200 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-ghost">
          Filter
        </button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-paper-200 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Est. total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-paper-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/quotes/${q.id}`}
                    className="font-medium text-signal-limeInk"
                  >
                    {q.name}
                  </Link>
                  <div className="text-xs text-paper-500">{q.email}</div>
                  {q.company && (
                    <div className="text-[11px] text-ink-500">{q.company}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>{q.productName || q.productSlug || "—"}</div>
                  {q.category && (
                    <div className="font-mono text-[10px] uppercase text-paper-500">
                      {q.category}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">{q.qty}</td>
                <td className="px-4 py-3 font-mono">
                  {q.estimatedTotal != null ? formatINR(q.estimatedTotal) : "—"}
                  {q.tierDiscountPercent ? (
                    <div className="text-[10px] text-signal-limeInk">
                      -{q.tierDiscountPercent}%
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={q.status} />
                </td>
                <td className="px-4 py-3 text-paper-500">
                  {new Date(q.createdAt).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-paper-500">
                  No quotes yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-signal-lime/15 text-signal-limeInk",
    reviewing: "bg-signal-sky/15 text-signal-sky",
    quoted: "bg-signal-violet/15 text-signal-violet",
    won: "bg-signal-lime/20 text-signal-limeInk",
    lost: "bg-paper-100 text-paper-500"
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        map[status] || "bg-paper-100 text-paper-600"
      }`}
    >
      {status}
    </span>
  );
}
