-- CreateTable
CREATE TABLE "BarberAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT NOT NULL,
    "weekDay" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BarberAvailability_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BarberBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT NOT NULL,
    "startDateTime" DATETIME NOT NULL,
    "endDateTime" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BarberBlock_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientNote_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClientNote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt") SELECT "createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_barberId_idx" ON "Service"("barberId");
CREATE INDEX "Service_barberId_isActive_idx" ON "Service"("barberId", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BarberAvailability_barberId_weekDay_idx" ON "BarberAvailability"("barberId", "weekDay");

-- CreateIndex
CREATE UNIQUE INDEX "BarberAvailability_barberId_weekDay_key" ON "BarberAvailability"("barberId", "weekDay");

-- CreateIndex
CREATE INDEX "BarberBlock_barberId_startDateTime_idx" ON "BarberBlock"("barberId", "startDateTime");

-- CreateIndex
CREATE INDEX "BarberBlock_barberId_endDateTime_idx" ON "BarberBlock"("barberId", "endDateTime");

-- CreateIndex
CREATE INDEX "ClientNote_barberId_idx" ON "ClientNote"("barberId");

-- CreateIndex
CREATE INDEX "ClientNote_customerId_idx" ON "ClientNote"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientNote_barberId_customerId_key" ON "ClientNote"("barberId", "customerId");

-- CreateIndex
CREATE INDEX "Appointment_barberId_status_idx" ON "Appointment"("barberId", "status");
