import { readdir } from "fs/promises";
import path from "path";
import CopyUrlButton from "@/components/admin/CopyUrlButton";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  const dir = path.join(process.cwd(), "public", "uploads", "designs");
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => !f.startsWith("."));
  } catch {
    files = [];
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Uploads</h1>
      <p className="mt-1 text-sm text-ink-300">
        Custom designs from the studio ({files.length})
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.map((f) => {
          const url = `/uploads/designs/${f}`;
          return (
            <div key={f} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={f} className="aspect-square w-full bg-ink-900 object-contain" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="truncate font-mono text-[10px] text-ink-400">{f}</div>
                <CopyUrlButton url={url} />
              </div>
            </div>
          );
        })}
      </div>

      {files.length === 0 && (
        <div className="card mt-8 p-10 text-center text-ink-400">
          No design uploads yet. They appear when customers use the Design Studio.
        </div>
      )}
    </div>
  );
}
