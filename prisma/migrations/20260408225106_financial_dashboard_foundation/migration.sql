-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppointmentService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "nameSnapshot" TEXT NOT NULL,
    "priceSnapshot" REAL NOT NULL,
    "durationSnapshot" INTEGER NOT NULL,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "commissionTypeSnapshot" TEXT NOT NULL DEFAULT 'PERCENT',
    "commissionValueSnapshot" REAL NOT NULL DEFAULT 40,
    "barberPayoutSnapshot" REAL NOT NULL DEFAULT 0,
    "shopRevenueSnapshot" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AppointmentService_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AppointmentService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AppointmentService" ("appointmentId", "bufferAfter", "createdAt", "durationSnapshot", "id", "nameSnapshot", "orderIndex", "priceSnapshot", "serviceId") SELECT "appointmentId", "bufferAfter", "createdAt", "durationSnapshot", "id", "nameSnapshot", "orderIndex", "priceSnapshot", "serviceId" FROM "AppointmentService";
DROP TABLE "AppointmentService";
ALTER TABLE "new_AppointmentService" RENAME TO "AppointmentService";
CREATE INDEX "AppointmentService_appointmentId_orderIndex_idx" ON "AppointmentService"("appointmentId", "orderIndex");
CREATE INDEX "AppointmentService_serviceId_idx" ON "AppointmentService"("serviceId");
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barberId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "bufferAfter" INTEGER NOT NULL DEFAULT 0,
    "commissionType" TEXT NOT NULL DEFAULT 'PERCENT',
    "commissionValue" REAL NOT NULL DEFAULT 40,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("barberId", "bufferAfter", "createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt") SELECT "barberId", "bufferAfter", "createdAt", "description", "duration", "id", "isActive", "name", "price", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE INDEX "Service_barberId_idx" ON "Service"("barberId");
CREATE INDEX "Service_barberId_isActive_idx" ON "Service"("barberId", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
