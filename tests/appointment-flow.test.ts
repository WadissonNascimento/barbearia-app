import assert from "node:assert/strict";
import { copyFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  AppointmentMutationError,
  createCustomerAppointment,
  updateAppointmentStatusForBarber,
} from "@/lib/appointmentMutations";

function getNextBusinessDay(baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 1);

  return date;
}

async function setupDatabase() {
  const fileName = `test-${Date.now()}-${Math.round(Math.random() * 100000)}.db`;
  const tempFilePath = join(process.cwd(), "prisma", fileName);
  const databaseUrl = `file:./${fileName}`;

  copyFileSync(join(process.cwd(), "prisma", "dev.db"), tempFilePath);

  const db = new PrismaClient({
    datasourceUrl: databaseUrl,
  });

  return {
    db,
    cleanup() {
      rmSync(tempFilePath, { force: true });
    },
  };
}

async function createFixture(db: PrismaClient) {
  const suffix = `${Date.now()}-${Math.round(Math.random() * 100000)}`;
  const barber = await db.user.create({
    data: {
      name: "Lucas Teste",
      email: `lucas-${suffix}@test.local`,
      role: "BARBER",
      isActive: true,
    },
  });

  const customer = await db.user.create({
    data: {
      name: "Cliente Teste",
      email: `cliente-${suffix}@test.local`,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  await Promise.all(
    [0, 2, 3, 4, 5, 6].map((weekDay) =>
      db.barberAvailability.create({
        data: {
          barberId: barber.id,
          weekDay,
          startTime: "09:00",
          endTime: "20:00",
          isActive: true,
        },
      })
    )
  );

  const corte = await db.service.create({
    data: {
      name: "Corte",
      price: 45,
      duration: 45,
      bufferAfter: 5,
      commissionType: "PERCENT",
      commissionValue: 40,
      isActive: true,
    },
  });

  const barba = await db.service.create({
    data: {
      name: "Barba",
      price: 30,
      duration: 30,
      bufferAfter: 5,
      commissionType: "PERCENT",
      commissionValue: 40,
      isActive: true,
    },
  });

  return { barber, customer, corte, barba };
}

test("customer can book and conclude an appointment", async () => {
  const { db, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte, barba } = await createFixture(db);
    const nextDay = getNextBusinessDay();
    const date = nextDay.toISOString().slice(0, 10);

    const appointment = await createCustomerAppointment(
      {
        customerId: customer.id,
        barberId: barber.id,
        serviceIds: [corte.id, barba.id],
        date,
        time: "10:00",
        notes: "Cliente prefere acabamento baixo.",
      },
      db
    );

    assert.equal(appointment.customerId, customer.id);
    assert.equal(appointment.barberId, barber.id);
    assert.equal(appointment.status, "PENDING");
    assert.equal(appointment.services.length, 2);
    assert.equal(appointment.services[0].nameSnapshot, "Corte");
    assert.equal(appointment.services[1].nameSnapshot, "Barba");

    await updateAppointmentStatusForBarber(
      {
        appointmentId: appointment.id,
        barberId: barber.id,
        status: "CONFIRMED",
      },
      db
    );

    await updateAppointmentStatusForBarber(
      {
        appointmentId: appointment.id,
        barberId: barber.id,
        status: "COMPLETED",
      },
      db
    );

    const updated = await db.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        services: true,
      },
    });

    assert.ok(updated);
    assert.equal(updated.status, "COMPLETED");
    assert.equal(updated.services.every((service) => service.barberPayoutSnapshot > 0), true);
    assert.equal(updated.services.every((service) => service.shopRevenueSnapshot >= 0), true);
  } finally {
    await db.$disconnect();
    cleanup();
  }
});

test("customer cannot create overlapping appointment for the same barber", async () => {
  const { db, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte } = await createFixture(db);
    const nextDay = getNextBusinessDay();
    const date = nextDay.toISOString().slice(0, 10);

    await createCustomerAppointment(
      {
        customerId: customer.id,
        barberId: barber.id,
        serviceIds: [corte.id],
        date,
        time: "14:00",
      },
      db
    );

    await assert.rejects(
      () =>
        createCustomerAppointment(
          {
            customerId: customer.id,
            barberId: barber.id,
            serviceIds: [corte.id],
            date,
            time: "14:20",
          },
          db
        ),
      (error: unknown) =>
        error instanceof AppointmentMutationError &&
        error.message === "Esse horario acabou de ser reservado. Escolha outro horario."
    );
  } finally {
    await db.$disconnect();
    cleanup();
  }
});
