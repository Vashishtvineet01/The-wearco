import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/products";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { colors: true, sizes: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-ink-300">{products.length} in catalog</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + New product
        </Link>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Drop</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  <div className="font-mono text-[10px] text-ink-400">{p.slug}</div>
                </td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3 font-mono">{formatINR(p.price)}</td>
                <td className="px-4 py-3 text-ink-300">{p.drop}</td>
                <td className="px-4 py-3">
                  <ToggleActiveButton id={p.id} active={p.active} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-signal-lime hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
