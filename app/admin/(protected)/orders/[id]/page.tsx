import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true }
  });
  if (!order) notFound();

  const address = JSON.parse(order.address) as {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-ink-400 hover:text-ink-100">
            ← Orders
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-300">
            {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
            {order.paymentMethod.toUpperCase()}
          </p>
        </div>
        <OrderStatusForm id={order.id} status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-2 p-5 lg:col-span-1">
          <h2 className="font-display text-lg font-semibold">Customer</h2>
          <p>{order.name}</p>
          <p className="text-sm text-ink-300">{order.email}</p>
          <p className="text-sm text-ink-300">{order.phone}</p>
          {order.gst && <p className="text-xs text-ink-400">GST: {order.gst}</p>}
          <div className="mt-4 border-t border-white/10 pt-4 text-sm text-ink-200">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Ship to
            </div>
            <p className="mt-2">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              {address.country}
            </p>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item) => {
              let custom: { text?: string; imageUrl?: string } | null = null;
              try {
                custom = item.customDesign ? JSON.parse(item.customDesign) : null;
              } catch {
                custom = null;
              }
              const img = item.designImagePath || custom?.imageUrl;
              return (
                <li
                  key={item.id}
                  className="flex gap-4 border-b border-white/5 pb-4 last:border-0"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      className="h-20 w-20 rounded-lg bg-ink-900 object-contain"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center rounded-lg bg-ink-900 text-[10px] text-ink-500">
                      No art
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="font-mono text-[11px] uppercase text-ink-400">
                      {item.size} · {item.color} · ×{item.qty}
                    </div>
                    {custom?.text && (
                      <div className="mt-1 text-xs text-ink-300">&quot;{custom.text}&quot;</div>
                    )}
                  </div>
                  <div className="font-mono">{formatINR(item.price * item.qty)}</div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-ink-300">
              <span>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-300">
              <span>Shipping</span>
              <span>{formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
