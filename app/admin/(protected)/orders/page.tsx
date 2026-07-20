import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = searchParams.status || "all";
  const q = (searchParams.q || "").trim();

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status !== "all" ? { status } : {},
        q
          ? {
              OR: [
                { orderNumber: { contains: q } },
                { email: { contains: q } },
                { name: { contains: q } }
              ]
            }
          : {}
      ]
    },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  const statuses = ["all", "pending", "paid", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-ink-300">{orders.length} shown</p>

      <form className="mt-6 flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
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
          placeholder="Search email / order #"
          className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
        />
        <button type="submit" className="btn-ghost">
          Filter
        </button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-signal-lime">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{o.name}</div>
                  <div className="text-xs text-ink-400">{o.email}</div>
                </td>
                <td className="px-4 py-3">{o.items.length}</td>
                <td className="px-4 py-3 font-mono">{formatINR(o.total)}</td>
                <td className="px-4 py-3 capitalize">{o.status}</td>
                <td className="px-4 py-3 text-ink-400">
                  {new Date(o.createdAt).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
