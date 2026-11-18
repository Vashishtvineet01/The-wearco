import Link from "next/link";

export const metadata = { title: "My Payments — TheWearCo" };

export default function AccountPaymentsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">
        My Payments
      </h1>
      <p className="mt-1 text-sm text-paper-500">
        View and manage payment methods.
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-paper-300 bg-white px-6 py-14 text-center">
        <p className="text-sm text-paper-600">
          Cards and UPI are entered securely at checkout — nothing stored here yet.
        </p>
        <Link
          href="/checkout"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-paper-900 px-5 text-sm font-bold uppercase tracking-[0.06em] text-white"
        >
          Go to checkout
        </Link>
      </div>
    </div>
  );
}
