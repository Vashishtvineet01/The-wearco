import Link from "next/link";

export const metadata = { title: "Help & Support — TheWearCo" };

export default function AccountHelpPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">
        Help & Support
      </h1>
      <p className="mt-1 text-sm text-paper-500">Reach out to us anytime.</p>

      <div className="mt-6 space-y-3">
        <Link
          href="/contact"
          className="block rounded-xl border border-[#e8e8e8] bg-white p-5 transition hover:border-paper-400"
        >
          <div className="font-semibold text-paper-900">Contact us</div>
          <p className="mt-1 text-sm text-paper-500">
            Order issues, exchanges, custom briefs.
          </p>
        </Link>
        <Link
          href="/track"
          className="block rounded-xl border border-[#e8e8e8] bg-white p-5 transition hover:border-paper-400"
        >
          <div className="font-semibold text-paper-900">Track an order</div>
          <p className="mt-1 text-sm text-paper-500">
            Enter your order number and email.
          </p>
        </Link>
        <a
          href="mailto:hi@thewearco.com"
          className="block rounded-xl border border-[#e8e8e8] bg-white p-5 transition hover:border-paper-400"
        >
          <div className="font-semibold text-paper-900">Email</div>
          <p className="mt-1 text-sm text-paper-500">hi@thewearco.com</p>
        </a>
      </div>
    </div>
  );
}
