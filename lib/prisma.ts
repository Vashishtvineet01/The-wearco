import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

/**
 * On Vercel the filesystem is read-only except /tmp.
 * Copy the build-time SQLite DB into /tmp so reads (and cold-start writes) work.
 */
function resolveDatabaseUrl(): string {
  const bundled = path.join(process.cwd(), "prisma", "dev.db");
  const absoluteFile = `file:${bundled}`;

  // Local / non-Vercel: always use prisma/dev.db (absolute) so cwd
  // differences never point at an empty ./dev.db without Customer tables.
  if (!process.env.VERCEL) {
    if (process.env.DATABASE_URL?.startsWith("file:")) {
      return absoluteFile;
    }
    return process.env.DATABASE_URL || absoluteFile;
  }

  // Vercel: filesystem is read-only except /tmp — copy the bundled DB there.
  const tmpDb = "/tmp/thewearco.db";
  try {
    mkdirSync("/tmp", { recursive: true });
    // Always refresh from the build artifact so new tables (Customer, etc.) ship.
    if (existsSync(bundled)) {
      copyFileSync(bundled, tmpDb);
    }
  } catch (e) {
    console.error("[prisma] failed to copy sqlite to /tmp", e);
  }

  if (existsSync(tmpDb)) {
    return `file:${tmpDb}`;
  }

  return absoluteFile;
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
