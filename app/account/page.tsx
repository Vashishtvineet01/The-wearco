import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import { formatINR } from "@/lib/products";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your account — TheWearCo",
  description: "Your orders, saved details and community access.",
};

/**
 * Protected by middleware — redirects to /login?next=/account for anyone
 * without a customer session. We still do a server-side guard here as a
 * belt-and-braces measure.
 */
export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session.isLoggedIn || !session.customerId) {
    redirect("/login?next=/account");
  }

  const email = session.email || null;
  const phone = session.phone || null;
  const displayName =
    email?.split("@")[0] ||
    (phone ? phone.replace(/^\+91/, "") : "member");

  // Orders join by email when the account has one; phone-only accounts
  // start empty until they place an order while signed in (or add email).
  const orders = email
    ? await prisma.order.findMany({
        where: { email },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: {
            select: {
              name: true,
              qty: true,
              size: true,
              color: true,
              price: true,
            },
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
              select: {
                name: true,
                qty: true,
                size: true,
                color: true,
                price: true,
              },
            },
          },
        })
      : [];

  // Pull the most-recent address as the "default" shown in the sidebar.
  const lastAddress = (() => {
    const o = orders.find((o) => o.address);
    if (!o?.address) return null;
    try {
      return JSON.parse(o.address) as {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
      };
    } catch {
      return null;
    }
  })();

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid" || o.paymentMethod === "cod")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      {/* Hero */}
      <section className="relative mb-10 pb-8 pt-2">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="hidden h-px w-8 bg-paper-400 sm:block" />
              <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                Your account
              </div>
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-paper-900 md:text-5xl">
              Welcome back, <span className="gradient-text">{displayName}.</span>
            </h1>
            <p className="mt-2 text-sm text-paper-600">
              Signed in as {email || phone || "your account"}.
            </p>
          </div>
          <LogoutButton />
        </div>
        <div aria-hidden className="mt-8 h-px max-w-3xl bg-paper-200" />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Orders */}
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-600">
                // Orders
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold">
                {orders.length === 0 ? "No orders yet." : `${orders.length} order${orders.length === 1 ? "" : "s"}`}
              </h2>
            </div>
            {orders.length === 0 && (
              <Link href="/shop" className="btn-ghost">Browse the drops →</Link>
            )}
          </div>

          {orders.length > 0 ? (
            <ul className="space-y-3">
              {orders.map((o) => {
                const first = o.items[0];
                return (
                  <li key={o.id}>
                    <Link
                      href={`/track?order=${encodeURIComponent(o.orderNumber)}&email=${encodeURIComponent(email || o.email)}`}
                      className="card group block p-5 transition hover:border-paper-400 hover:shadow-[0_12px_40px_-24px_rgba(124,92,255,0.45)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
                            {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {o.orderNumber}
                          </div>
                          <div className="mt-1 truncate font-display text-base font-semibold">
                            {first?.name || "Order"}
                            {o.items.length > 1 && (
                              <span className="ml-1 text-paper-500">
                                + {o.items.length - 1} more
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <StatusChip status={o.status} />
                            <PayChip paymentStatus={o.paymentStatus} method={o.paymentMethod} />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-bold">
                            {formatINR(o.total)}
                          </div>
                          <div className="mt-1 text-xs text-signal-violetInk group-hover:underline">
                            Track →
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="card border-dashed p-10 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-limeInk">
                // Empty shelf
              </div>
              <p className="mx-auto mt-3 max-w-sm text-sm text-paper-600">
                When you place an order, it&apos;ll show up here — including any you
                placed as a guest with this email in the past.
              </p>
              <Link href="/shop" className="btn-primary mt-5 inline-flex">
                Browse drops
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
              // Lifetime
            </div>
            <div className="mt-1 font-display text-2xl font-bold">
              {formatINR(totalSpent)}
            </div>
            <div className="mt-0.5 text-xs text-paper-600">
              across {orders.length} order{orders.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
              // Default address
            </div>
            {lastAddress ? (
              <div className="mt-2 text-sm text-paper-800">
                <div>{lastAddress.line1}{lastAddress.line2 ? ", " + lastAddress.line2 : ""}</div>
                <div>{lastAddress.city}, {lastAddress.state} {lastAddress.pincode}</div>
                <div>{lastAddress.country || "India"}</div>
                <p className="mt-2 text-xs text-paper-500">
                  Pulled from your last order. Update it at checkout next time.
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-paper-600">
                We&apos;ll save your address automatically from your first order.
              </p>
            )}
          </div>

          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
              // Community
            </div>
            <p className="mt-2 text-sm text-paper-700">
              Every QR-tagged piece unlocks the founder Discord and monthly
              office hours.
            </p>
            <Link href="/community" className="btn-ghost mt-4 inline-flex">
              Read how it works →
            </Link>
          </div>

          <div className="card p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper-500">
              // Need help?
            </div>
            <p className="mt-2 text-sm text-paper-700">
              Order problem, exchange, custom brief — reply to any
              confirmation email or write to{" "}
              <a href="mailto:hi@thewearco.com" className="text-signal-violetInk underline">hi@thewearco.com</a>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const classes =
    status === "delivered"
      ? "border-signal-lime/50 bg-signal-lime/10 text-signal-limeInk"
      : status === "shipped"
        ? "border-signal-violetInk/40 bg-signal-violet/10 text-signal-violetInk"
        : status === "cancelled"
          ? "border-signal-coral/40 bg-signal-coral/10 text-signal-coral"
          : "";
  return <span className={`tag ${classes}`}>{label}</span>;
}

function PayChip({
  paymentStatus,
  method,
}: {
  paymentStatus: string;
  method: string;
}) {
  if (method === "cod" && paymentStatus !== "paid") {
    return <span className="tag">COD on delivery</span>;
  }
  const label =
    paymentStatus === "paid"
      ? "Paid"
      : paymentStatus === "failed"
        ? "Payment failed"
        : paymentStatus === "refunded"
          ? "Refunded"
          : "Payment pending";
  const classes =
    paymentStatus === "failed"
      ? "border-signal-coral/40 bg-signal-coral/10 text-signal-coral"
      : paymentStatus === "paid"
        ? "border-signal-lime/50 bg-signal-lime/10 text-signal-limeInk"
        : "";
  return <span className={`tag ${classes}`}>{label}</span>;
}
