import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml"
]);

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg"
};

export async function saveDesignUpload(file: File): Promise<{ url: string; path: string }> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only PNG, JPG, WEBP, or SVG allowed");
  }
  const ext = EXT[file.type] || "png";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(UPLOAD_ROOT, "designs");
  await mkdir(dir, { recursive: true });
  const abs = path.join(dir, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);
  return { url: `/uploads/designs/${name}`, path: abs };
}

export async function saveDataUrlToOrder(
  orderId: string,
  index: number,
  dataUrl: string
): Promise<string> {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid data URL");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const dir = path.join(UPLOAD_ROOT, "orders", orderId);
  await mkdir(dir, { recursive: true });
  const filename = `${index}.${ext}`;
  const abs = path.join(dir, filename);
  await writeFile(abs, Buffer.from(match[2], "base64"));
  return `/uploads/orders/${orderId}/${filename}`;
}

export async function copyDesignUrlToOrder(
  orderId: string,
  index: number,
  imageUrl: string
): Promise<string | null> {
  if (!imageUrl.startsWith("/uploads/")) return null;
  const { copyFile } = await import("fs/promises");
  const src = path.join(process.cwd(), "public", imageUrl);
  const dir = path.join(UPLOAD_ROOT, "orders", orderId);
  await mkdir(dir, { recursive: true });
  const ext = path.extname(src) || ".png";
  const filename = `${index}${ext}`;
  const dest = path.join(dir, filename);
  try {
    await copyFile(src, dest);
    return `/uploads/orders/${orderId}/${filename}`;
  } catch {
    return imageUrl;
  }
}

export function generateOrderNumber() {
  return "TWC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
