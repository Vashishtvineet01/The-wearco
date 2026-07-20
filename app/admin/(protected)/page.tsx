import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [ordersToday, pending, revenueAgg, subscribers, recent] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.count({ where: { status: "pending" } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.newsletterSubscriber.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true }
    })
  ]);

  const revenue = revenueAgg._sum.total || 0;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-300">Store overview</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Orders today" value={String(ordersToday)} />
        <Kpi label="Pending orders" value={String(pending)} />
        <Kpi label="Total revenue" value={formatINR(revenue)} />
        <Kpi label="Subscribers" value={String(subscribers)} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-signal-lime">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-white/5">
            {recent.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-400">No orders yet</li>
            )}
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <Link href={`/admin/orders/${o.id}`} className="font-mono text-signal-lime">
                    {o.orderNumber}
                  </Link>
                  <div className="text-xs text-ink-400">
                    {o.name} · {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono">{formatINR(o.total)}</div>
                  <StatusPill status={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-semibold">Quick links</h2>
          <div className="mt-4 grid gap-2">
            <Link href="/admin/products/new" className="btn-primary justify-start">
              + New product
            </Link>
            <Link href="/admin/orders" className="btn-ghost justify-start">
              Manage orders
            </Link>
            <Link href="/admin/subscribers" className="btn-ghost justify-start">
              Newsletter list
            </Link>
            <Link href="/" className="btn-ghost justify-start">
              Open storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400">{label}</div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">{status}</span>
  );
}
