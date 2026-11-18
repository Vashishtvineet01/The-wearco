import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import { formatINR } from "@/lib/products";

export const metadata = { title: "My Orders — TheWearCo" };

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  const email = session.email || null;
  const phone = session.phone || null;

  const orders = email
    ? await prisma.order.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: {
            select: { name: true, qty: true, size: true, color: true, price: true },
          },
        },
      })
    : phone
      ? await prisma.order.findMany({
          where: { phone },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            items: {
              select: { name: true, qty: true, size: true, color: true, price: true },
            },
          },
        })
      : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">My Orders</h1>
      <p className="mt-1 text-sm text-paper-500">
        View, modify and track your WearCo orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-paper-300 bg-white px-6 py-14 text-center">
          <p className="text-sm text-paper-600">No orders yet.</p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-paper-900 px-5 text-sm font-bold uppercase tracking-[0.06em] text-white"
          >
            Browse drops
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => {
            const first = o.items[0];
            return (
              <li key={o.id}>
                <Link
                  href={`/track?order=${encodeURIComponent(o.orderNumber)}&email=${encodeURIComponent(email || o.email)}`}
                  className="block rounded-xl border border-[#e8e8e8] bg-white p-5 transition hover:border-paper-400"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {o.orderNumber}
                      </div>
                      <div className="mt-1 truncate font-semibold text-paper-900">
                        {first?.name || "Order"}
                        {o.items.length > 1 && (
                          <span className="ml-1 text-paper-500">
                            + {o.items.length - 1} more
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs capitalize text-paper-600">
                        {o.status}
                        {o.paymentMethod === "cod" ? " · COD" : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-paper-900">
                        {formatINR(o.total)}
                      </div>
                      <div className="mt-1 text-xs text-[#b45309]">Track →</div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
