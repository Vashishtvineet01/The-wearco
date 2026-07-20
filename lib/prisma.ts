import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

/**
 * On Vercel the filesystem is read-only except /tmp.
 * Copy the build-time SQLite DB into /tmp so reads (and cold-start writes) work.
 */
function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL;
  if (!process.env.VERCEL) {
    return configured || "file:./dev.db";
  }

  const tmpDb = "/tmp/thewearco.db";
  const bundled = path.join(process.cwd(), "prisma", "dev.db");

  try {
    if (!existsSync(tmpDb) && existsSync(bundled)) {
      mkdirSync("/tmp", { recursive: true });
      copyFileSync(bundled, tmpDb);
    }
  } catch (e) {
    console.error("[prisma] failed to copy sqlite to /tmp", e);
  }

  if (existsSync(tmpDb)) {
    return `file:${tmpDb}`;
  }

  return configured || `file:${bundled}`;
}

const datasourceUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: datasourceUrl } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
