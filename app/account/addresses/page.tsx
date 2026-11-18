import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export const metadata = { title: "My Addresses — TheWearCo" };

export default async function AccountAddressesPage() {
  const session = await getCustomerSession();
  const email = session.email || null;
  const phone = session.phone || null;

  const order = email
    ? await prisma.order.findFirst({
        where: { email, NOT: { address: "" } },
        orderBy: { createdAt: "desc" },
        select: { address: true, name: true },
      })
    : phone
      ? await prisma.order.findFirst({
          where: { phone, NOT: { address: "" } },
          orderBy: { createdAt: "desc" },
          select: { address: true, name: true },
        })
      : null;

  let address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } | null = null;
  if (order?.address) {
    try {
      address = JSON.parse(order.address);
    } catch {
      address = null;
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">
        My Addresses
      </h1>
      <p className="mt-1 text-sm text-paper-500">
        Edit, add or remove delivery addresses.
      </p>

      {address ? (
        <div className="mt-6 rounded-xl border border-[#e8e8e8] bg-white p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-paper-500">
            Default
          </div>
          {order?.name && (
            <div className="mt-2 font-semibold text-paper-900">{order.name}</div>
          )}
          <div className="mt-1 text-sm leading-relaxed text-paper-700">
            <div>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
            </div>
            <div>
              {address.city}, {address.state} {address.pincode}
            </div>
            <div>{address.country || "India"}</div>
          </div>
          <p className="mt-4 text-xs text-paper-500">
            Saved from your last order. Update it at checkout next time.
          </p>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-paper-300 bg-white px-6 py-14 text-center">
          <p className="text-sm text-paper-600">
            No saved addresses yet. We&apos;ll keep the one from your first order.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex h-11 items-center rounded-lg bg-paper-900 px-5 text-sm font-bold uppercase tracking-[0.06em] text-white"
          >
            Start shopping
          </Link>
        </div>
      )}
    </div>
  );
}
