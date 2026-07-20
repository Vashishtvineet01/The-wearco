import { prisma } from "@/lib/prisma";
import ExportCsvButton from "@/components/admin/ExportCsvButton";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" }
  });

  const csv = [
    "email,subscribed_at",
    ...subscribers.map(
      (s) => `${s.email},${new Date(s.createdAt).toISOString()}`
    )
  ].join("\n");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscribers</h1>
          <p className="mt-1 text-sm text-ink-300">{subscribers.length} emails</p>
        </div>
        <ExportCsvButton csv={csv} filename="thewearco-subscribers.csv" />
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3 text-ink-400">
                  {new Date(s.createdAt).toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-10 text-center text-ink-400">
                  No subscribers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
