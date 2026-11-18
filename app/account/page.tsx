import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";

export const metadata = {
  title: "My Account — TheWearCo",
  description: "Your orders, profile, addresses and more.",
};

export default async function AccountOverviewPage() {
  const session = await getCustomerSession();
  const customer = session.customerId
    ? await prisma.customer.findUnique({
        where: { id: session.customerId },
        select: { name: true, email: true, phone: true },
      })
    : null;

  const email = customer?.email || session.email || null;
  const phone = customer?.phone || session.phone || null;
  const phoneDisplay = phone
    ? phone.replace(/^\+91/, "").replace(/^91/, "")
    : null;
  const displayName =
    customer?.name?.trim() ||
    (email ? email.split("@")[0] : null) ||
    phoneDisplay ||
    "Member";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl bg-[#fff3c4] px-6 pb-5 pt-6 sm:px-8">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#facc15] text-2xl font-bold text-paper-900">
            {initial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-paper-900">
              {displayName}
            </div>
            {email && (
              <div className="mt-0.5 truncate text-sm text-paper-700">{email}</div>
            )}
            {phoneDisplay && (
              <div className="mt-0.5 text-sm text-paper-700">{phoneDisplay}</div>
            )}
          </div>
        </div>
        <Link
          href="/account/profile"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-lg bg-[#facc15] text-sm font-bold uppercase tracking-[0.06em] text-paper-900 transition hover:bg-[#f59e0b]"
        >
          Edit Profile
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TILES.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex flex-col items-center rounded-xl border border-[#e8e8e8] bg-white px-5 py-8 text-center transition hover:border-paper-400 hover:shadow-[0_8px_24px_-16px_rgba(20,17,14,0.35)]"
          >
            <TileIcon name={tile.icon} />
            <div className="mt-4 text-[15px] font-bold text-paper-900">
              {tile.title}
            </div>
            <p className="mt-1.5 max-w-[220px] text-[13px] leading-snug text-paper-500">
              {tile.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const TILES = [
  {
    href: "/account/orders",
    title: "My Orders",
    subtitle: "View, Modify And Track Orders",
    icon: "orders",
  },
  {
    href: "/account/payments",
    title: "My Payments",
    subtitle: "View And Modify Payment Methods",
    icon: "payments",
  },
  {
    href: "/account/wallet",
    title: "My Wallet",
    subtitle: "TheWearCo Wallet History And Gift Cards",
    icon: "wallet",
  },
  {
    href: "/account/addresses",
    title: "My Addresses",
    subtitle: "Edit, Add Or Remove Addresses",
    icon: "addresses",
  },
  {
    href: "/account/profile",
    title: "My Profile",
    subtitle: "Edit Personal Info And Change Password",
    icon: "profile",
  },
  {
    href: "/account/help",
    title: "Help & Support",
    subtitle: "Reach Out To Us",
    icon: "help",
  },
] as const;

function TileIcon({ name }: { name: string }) {
  const cls = "h-10 w-10 text-paper-800";
  switch (name) {
    case "orders":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2" />
          <path d="M9 12h6M9 16h4" />
        </svg>
      );
    case "payments":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="6" width="20" height="13" rx="2" />
          <path d="M2 11h20" />
          <path d="M6 16h4" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
          <path d="M3 8V6a2 2 0 0 1 2-2h12l4 4" />
          <circle cx="16.5" cy="14" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "addresses":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
        </svg>
      );
    case "help":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v.01" />
          <path d="M12 13a2 2 0 1 0-1.5-3.3" />
        </svg>
      );
    default:
      return null;
  }
}
