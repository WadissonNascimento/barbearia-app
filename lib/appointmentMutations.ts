import { Prisma, type PrismaClient } from "@prisma/client";
import {
  APPOINTMENT_STATUSES,
  normalizeAppointmentStatus,
  type AppointmentStatus,
} from "@/lib/appointmentStatus";
import {
  getAppointmentServicesOccupiedDuration,
  isActiveAppointmentStatus,
  isBlockedByRecurringBlock,
  isBlockedPeriod,
  toMinutes,
} from "@/lib/barberSchedule";
import { calculateServiceFinancials, syncAppointmentFinancialSnapshots } from "@/lib/financials";
import { prisma } from "@/lib/prisma";

type AppointmentPrismaClient = Pick<
  PrismaClient,
  | "$transaction"
  | "$executeRaw"
  | "appointment"
  | "appointmentService"
  | "barberAvailability"
  | "barberBlock"
  | "recurringBarberBlock"
  | "service"
  | "user"
>;
type AppointmentTransactionClient = Omit<AppointmentPrismaClient, "$transaction">;

export class AppointmentMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentMutationError";
  }
}

export type CreateCustomerAppointmentInput = {
  customerId: string;
  barberId: string;
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string | null;
  now?: Date;
};

function getAppointmentDurationFromServices(
  services: Array<{
    duration: number;
    bufferAfter: number | null;
  }>
) {
  return getAppointmentServicesOccupiedDuration(
    services.map((service) => ({
      durationSnapshot: service.duration,
      bufferAfter: service.bufferAfter,
    }))
  );
}

export async function createCustomerAppointment(
  input: CreateCustomerAppointmentInput,
  db: AppointmentPrismaClient = prisma
) {
  try {
    return await db.$transaction(
      (tx) => createCustomerAppointmentInTransaction(input, tx),
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 20000,
      }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2034" || error.code === "P2028")
    ) {
      throw new AppointmentMutationError(
        "Esse horario acabou de ser reservado. Escolha outro horario."
      );
    }

    throw error;
  }
}

async function createCustomerAppointmentInTransaction(
  input: CreateCustomerAppointmentInput,
  db: AppointmentTransactionClient
) {
  const barberId = input.barberId.trim();
  const serviceIds = input.serviceIds.map((serviceId) => serviceId.trim()).filter(Boolean);
  const date = input.date.trim();
  const time = input.time.trim();
  const notes = input.notes?.trim() || null;

  if (!input.customerId || !barberId || serviceIds.length === 0 || !date || !time) {
    throw new AppointmentMutationError(
      "Selecione barbeiro, servicos, data e horario para continuar."
    );
  }

  const barber = await db.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
      isActive: true,
    },
  });

  if (!barber) {
    throw new AppointmentMutationError("O barbeiro selecionado nao esta mais disponivel.");
  }

  const availableServices = await db.service.findMany({
    where: {
      id: {
        in: serviceIds,
      },
      OR: [{ barberId }, { barberId: null }],
      isActive: true,
    },
  });

  if (availableServices.length !== serviceIds.length) {
    throw new AppointmentMutationError(
      "Um ou mais servicos escolhidos nao estao disponiveis para esse barbeiro."
    );
  }

  const serviceMap = new Map(availableServices.map((service) => [service.id, service] as const));
  const orderedServices = serviceIds
    .map((serviceId) => serviceMap.get(serviceId))
    .filter(
      (
        service
      ): service is (typeof availableServices)[number] => Boolean(service)
    );

  if (orderedServices.length !== serviceIds.length) {
    throw new AppointmentMutationError(
      "Nao foi possivel validar a ordem dos servicos selecionados."
    );
  }

  const appointmentDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new AppointmentMutationError("Data ou horario invalido.");
  }

  const now = input.now ?? new Date();
  if (appointmentDate.getTime() <= now.getTime()) {
    throw new AppointmentMutationError("Nao e possivel agendar em um horario que ja passou.");
  }

  const selectedDay = new Date(`${date}T00:00:00`);
  const dayOfWeek = selectedDay.getDay();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${barberId}), hashtext(${date}))`;

  const [availability, sameDayAppointments, blocks, recurringBlocks] = await Promise.all([
    db.barberAvailability.findFirst({
      where: {
        barberId,
        weekDay: dayOfWeek,
        isActive: true,
      },
    }),
    db.appointment.findMany({
      where: {
        barberId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        services: true,
      },
    }),
    db.barberBlock.findMany({
      where: {
        barberId,
        startDateTime: {
          lte: dayEnd,
        },
        endDateTime: {
          gte: dayStart,
        },
      },
    }),
    db.recurringBarberBlock.findMany({
      where: {
        barberId,
        weekDay: dayOfWeek,
        isActive: true,
      },
    }),
  ]);

  if (!availability) {
    throw new AppointmentMutationError("Este barbeiro nao atende nesse dia.");
  }

  const occupiedDuration = getAppointmentDurationFromServices(orderedServices);
  const selectedStartMinutes = toMinutes(time);
  const selectedEndMinutes = selectedStartMinutes + occupiedDuration;
  const availabilityStart = toMinutes(availability.startTime);
  const availabilityEnd = toMinutes(availability.endTime);

  if (selectedStartMinutes < availabilityStart || selectedEndMinutes > availabilityEnd) {
    throw new AppointmentMutationError(
      "O horario escolhido esta fora da disponibilidade do barbeiro."
    );
  }

  const endDate = new Date(appointmentDate.getTime() + occupiedDuration * 60000);

  if (isBlockedPeriod(appointmentDate, endDate, blocks)) {
    throw new AppointmentMutationError("O horario escolhido esta bloqueado pelo barbeiro.");
  }

  if (isBlockedByRecurringBlock(selectedStartMinutes, selectedEndMinutes, recurringBlocks)) {
    throw new AppointmentMutationError(
      "O horario escolhido entra em um bloqueio recorrente do barbeiro."
    );
  }

  const conflict = sameDayAppointments.some((appointment) => {
    if (!isActiveAppointmentStatus(appointment.status)) {
      return false;
    }

    const existingDate = new Date(appointment.date);
    const existingStartMinutes = existingDate.getHours() * 60 + existingDate.getMinutes();
    const existingEndMinutes =
      existingStartMinutes + getAppointmentServicesOccupiedDuration(appointment.services);

    return selectedStartMinutes < existingEndMinutes && selectedEndMinutes > existingStartMinutes;
  });

  if (conflict) {
    throw new AppointmentMutationError(
      "Esse horario acabou de ser reservado. Escolha outro horario."
    );
  }

  return db.appointment.create({
    data: {
      barberId,
      customerId: input.customerId,
      date: appointmentDate,
      notes,
      status: "PENDING",
      services: {
        create: orderedServices.map((service, index) => {
          const financials = calculateServiceFinancials(service);

          return {
            serviceId: service.id,
            orderIndex: index,
            nameSnapshot: service.name,
            priceSnapshot: service.price,
            durationSnapshot: service.duration,
            bufferAfter: service.bufferAfter || 0,
            commissionTypeSnapshot: financials.commissionType,
            commissionValueSnapshot: financials.commissionValue,
            barberPayoutSnapshot: financials.barberPayout,
            shopRevenueSnapshot: financials.shopRevenue,
          };
        }),
      },
    },
    include: {
      services: true,
      barber: true,
      customer: true,
    },
  });
}

export async function updateAppointmentStatusForBarber(
  {
    appointmentId,
    barberId,
    status,
  }: {
    appointmentId: string;
    barberId: string;
    status: string;
  },
  db: AppointmentPrismaClient = prisma
) {
  const normalizedStatus = normalizeAppointmentStatus(status) as AppointmentStatus;

  if (!appointmentId || !APPOINTMENT_STATUSES.includes(normalizedStatus)) {
    throw new AppointmentMutationError("Status de agendamento invalido.");
  }

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.barberId !== barberId) {
    throw new AppointmentMutationError(
      "Agendamento nao encontrado para este barbeiro."
    );
  }

  const updatedAppointment = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: normalizedStatus,
    },
  });

  if (normalizedStatus === "COMPLETED") {
    await syncAppointmentFinancialSnapshots(appointmentId, db);
  }

  return updatedAppointment;
}
