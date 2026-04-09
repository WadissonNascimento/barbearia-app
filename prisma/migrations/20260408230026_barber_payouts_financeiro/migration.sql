-- CreateTable
CREATE TABLE "BarberPayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "grossRevenue" REAL NOT NULL DEFAULT 0,
    "commissionTotal" REAL NOT NULL DEFAULT 0,
    "shopNetRevenue" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BarberPayout_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BarberPayout_barberId_status_idx" ON "BarberPayout"("barberId", "status");

-- CreateIndex
CREATE INDEX "BarberPayout_periodStart_periodEnd_idx" ON "BarberPayout"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "BarberPayout_barberId_periodStart_periodEnd_key" ON "BarberPayout"("barberId", "periodStart", "periodEnd");
