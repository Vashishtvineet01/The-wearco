-- AlterTable Customer: phone + nullable email
-- SQLite: recreate pattern via Prisma db push in practice; SQL for reference.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("id", "email", "name", "passwordHash", "createdAt", "updatedAt")
SELECT "id", "email", "name", "passwordHash", "createdAt", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

CREATE TABLE "new_MagicLinkToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MagicLinkToken" ("id", "email", "tokenHash", "expiresAt", "usedAt", "createdAt")
SELECT "id", "email", "tokenHash", "expiresAt", "usedAt", "createdAt" FROM "MagicLinkToken";
DROP TABLE "MagicLinkToken";
ALTER TABLE "new_MagicLinkToken" RENAME TO "MagicLinkToken";
CREATE UNIQUE INDEX "MagicLinkToken_tokenHash_key" ON "MagicLinkToken"("tokenHash");
CREATE INDEX "MagicLinkToken_email_idx" ON "MagicLinkToken"("email");
CREATE INDEX "MagicLinkToken_phone_idx" ON "MagicLinkToken"("phone");
CREATE INDEX "MagicLinkToken_expiresAt_idx" ON "MagicLinkToken"("expiresAt");

PRAGMA foreign_keys=ON;
