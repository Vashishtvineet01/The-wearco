export const metadata = { title: "My Wallet — TheWearCo" };

export default function AccountWalletPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-paper-900">My Wallet</h1>
      <p className="mt-1 text-sm text-paper-500">
        Wallet balance, history and gift cards.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white">
        <div className="bg-[#fff3c4] px-6 py-8 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-paper-600">
            Available balance
          </div>
          <div className="mt-2 font-display text-4xl font-bold text-paper-900">
            ₹0
          </div>
        </div>
        <div className="px-6 py-10 text-center text-sm text-paper-500">
          No wallet activity yet. Credits and gift cards will show up here.
        </div>
      </div>
    </div>
  );
}
