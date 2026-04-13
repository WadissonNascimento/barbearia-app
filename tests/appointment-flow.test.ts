import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  AppointmentMutationError,
  createCustomerAppointment,
  updateAppointmentStatusForBarber,
} from "@/lib/appointmentMutations";
import { getBookingAvailability } from "@/lib/bookingAvailability";

function getNextBusinessDay(baseDate = new Date()) {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);

  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 1);

  return date;
}

async function setupDatabase() {
  const db = new PrismaClient();
  const runId = `${Date.now()}-${Math.round(Math.random() * 100000)}`;

  return {
    db,
    runId,
    async cleanup() {
      await db.service.deleteMany({
        where: {
          name: {
            contains: runId,
          },
        },
      });
      await db.user.deleteMany({
        where: {
          email: {
            contains: `${runId}@test.local`,
          },
        },
      });
    },
  };
}

async function createFixture(db: PrismaClient, suffix: string) {
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
      name: `Corte Teste ${suffix}`,
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
      name: `Barba Teste ${suffix}`,
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
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte, barba } = await createFixture(db, runId);
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
    assert.equal(appointment.services[0].nameSnapshot, `Corte Teste ${runId}`);
    assert.equal(appointment.services[1].nameSnapshot, `Barba Teste ${runId}`);

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
    await cleanup();
    await db.$disconnect();
  }
});

test("customer cannot create overlapping appointment for the same barber", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte } = await createFixture(db, runId);
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
    await cleanup();
    await db.$disconnect();
  }
});

test("customer cannot create concurrent appointment for the same barber and time", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte } = await createFixture(db, runId);
    const secondCustomer = await db.user.create({
      data: {
        name: "Segundo Cliente Teste",
        email: `segundo-cliente-${runId}@test.local`,
        role: "CUSTOMER",
        isActive: true,
      },
    });
    const nextDay = getNextBusinessDay();
    const date = nextDay.toISOString().slice(0, 10);

    const results = await Promise.allSettled([
      createCustomerAppointment(
        {
          customerId: customer.id,
          barberId: barber.id,
          serviceIds: [corte.id],
          date,
          time: "16:00",
        },
        db
      ),
      createCustomerAppointment(
        {
          customerId: secondCustomer.id,
          barberId: barber.id,
          serviceIds: [corte.id],
          date,
          time: "16:00",
        },
        db
      ),
    ]);

    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");

    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.equal(
      rejected[0].reason instanceof AppointmentMutationError &&
        rejected[0].reason.message ===
          "Esse horario acabou de ser reservado. Escolha outro horario.",
      true
    );

    const appointmentCount = await db.appointment.count({
      where: {
        barberId: barber.id,
        date: new Date(`${date}T16:00:00`),
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    assert.equal(appointmentCount, 1);
  } finally {
    await cleanup();
    await db.$disconnect();
  }
});

test("booking availability respects recurring blocks and ignores cancelled appointments", async () => {
  const { db, runId, cleanup } = await setupDatabase();

  try {
    const { barber, customer, corte } = await createFixture(db, runId);
    const nextDay = getNextBusinessDay();
    const date = nextDay.toISOString().slice(0, 10);

    await db.recurringBarberBlock.create({
      data: {
        barberId: barber.id,
        weekDay: nextDay.getDay(),
        startTime: "13:00",
        endTime: "14:00",
        reason: "Almoco",
        isActive: true,
      },
    });

    const cancelled = await createCustomerAppointment(
      {
        customerId: customer.id,
        barberId: barber.id,
        serviceIds: [corte.id],
        date,
        time: "15:00",
      },
      db
    );

    await db.appointment.update({
      where: { id: cancelled.id },
      data: { status: "CANCELLED" },
    });

    const availability = await getBookingAvailability(
      {
        barberId: barber.id,
        serviceIds: [corte.id],
        date,
        now: new Date(`${date}T08:00:00`),
      },
      db
    );

    assert.equal(availability.periodSlots.afternoon.includes("13:00"), false);
    assert.equal(availability.periodSlots.afternoon.includes("13:10"), false);
    assert.equal(availability.periodSlots.afternoon.includes("15:00"), true);
  } finally {
    await cleanup();
    await db.$disconnect();
  }
});
