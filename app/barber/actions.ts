"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  APPOINTMENT_STATUSES,
  normalizeAppointmentStatus,
} from "@/lib/appointmentStatus";
import {
  AppointmentMutationError,
  updateAppointmentStatusForBarber,
} from "@/lib/appointmentMutations";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";
import { prisma } from "@/lib/prisma";

async function requireBarber() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "BARBER") {
    throw new Error("Nao autorizado.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "BARBER",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!barber) {
    throw new Error("Barbeiro inativo ou nao autorizado.");
  }

  return barber;
}

function isValidTimeRange(startTime: string, endTime: string) {
  return /^\d{2}:\d{2}$/.test(startTime) &&
    /^\d{2}:\d{2}$/.test(endTime) &&
    startTime < endTime;
}

function revalidateBarberViews() {
  revalidatePath("/barber");
  revalidatePath("/barber/agenda");
  revalidatePath("/barber/servicos");
  revalidatePath("/barber/disponibilidade");
  revalidatePath("/barber/clientes");
  revalidatePath("/agendar");
  revalidatePath("/customer");
  revalidatePath("/admin/agenda");
}

export async function updateAppointmentStatusAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const appointmentId = String(formData.get("appointmentId") || "");
  const status = normalizeAppointmentStatus(
    String(formData.get("status") || "")
  );

  if (!appointmentId || !APPOINTMENT_STATUSES.includes(status as never)) {
    return mutationError("Status de agendamento invalido.");
  }

  try {
    await updateAppointmentStatusForBarber({
      appointmentId,
      barberId: barber.id,
      status,
    });
  } catch (error) {
    if (error instanceof AppointmentMutationError) {
      return mutationError(error.message);
    }

    throw error;
  }

  revalidateBarberViews();
  return mutationSuccess("Status do agendamento atualizado.");
}

export async function createBarberServiceAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);
  const bufferAfter = Number(formData.get("bufferAfter") || 0);

  if (
    !name ||
    price <= 0 ||
    duration <= 0 ||
    bufferAfter < 0
  ) {
    return mutationError(
      "Preencha nome, preco, duracao e intervalo corretamente."
    );
  }

  await prisma.service.create({
    data: {
      barberId: barber.id,
      name,
      description: description || null,
      price,
      duration,
      bufferAfter,
      commissionType: "PERCENT",
      commissionValue: 40,
      isActive: true,
    },
  });

  revalidateBarberViews();
  return mutationSuccess("Servico criado com sucesso.");
}

export async function updateBarberServiceAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);
  const bufferAfter = Number(formData.get("bufferAfter") || 0);

  if (
    !serviceId ||
    !name ||
    price <= 0 ||
    duration <= 0 ||
    bufferAfter < 0
  ) {
    return mutationError(
      "Preencha nome, preco, duracao e intervalo corretamente."
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    return mutationError("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      description: description || null,
      price,
      duration,
      bufferAfter,
    },
  });

  revalidateBarberViews();
  return mutationSuccess("Servico atualizado com sucesso.");
}

export async function toggleBarberServiceAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    return mutationError("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      isActive: !service.isActive,
    },
  });

  revalidateBarberViews();
  return mutationSuccess(
    service.isActive ? "Servico desativado." : "Servico ativado."
  );
}

export async function deleteBarberServiceAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    return mutationError("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidateBarberViews();
  return mutationSuccess("Servico removido com sucesso.");
}

export async function saveBarberAvailabilityAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const weekDay = Number(formData.get("weekDay") || -1);
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const isActive = String(formData.get("isActive") || "false") === "true";

  if (weekDay < 0 || weekDay > 6 || !isValidTimeRange(startTime, endTime)) {
    return mutationError("Disponibilidade invalida.");
  }

  await prisma.barberAvailability.upsert({
    where: {
      barberId_weekDay: {
        barberId: barber.id,
        weekDay,
      },
    },
    update: {
      startTime,
      endTime,
      isActive,
    },
    create: {
      barberId: barber.id,
      weekDay,
      startTime,
      endTime,
      isActive,
    },
  });

  revalidateBarberViews();
  return mutationSuccess("Disponibilidade atualizada.");
}

export async function saveWeeklyBarberAvailabilityAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();

  const entries = Array.from({ length: 7 }, (_, weekDay) => {
    const startTime = String(formData.get(`day-${weekDay}-startTime`) || "");
    const endTime = String(formData.get(`day-${weekDay}-endTime`) || "");
    const isActive =
      String(formData.get(`day-${weekDay}-isActive`) || "false") === "true";

    if (!isValidTimeRange(startTime, endTime)) {
      throw new Error(`Horario invalido para o dia ${weekDay}.`);
    }

    return {
      weekDay,
      startTime,
      endTime,
      isActive,
    };
  });

  try {
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.barberAvailability.upsert({
          where: {
            barberId_weekDay: {
              barberId: barber.id,
              weekDay: entry.weekDay,
            },
          },
          update: {
            startTime: entry.startTime,
            endTime: entry.endTime,
            isActive: entry.isActive,
          },
          create: {
            barberId: barber.id,
            weekDay: entry.weekDay,
            startTime: entry.startTime,
            endTime: entry.endTime,
            isActive: entry.isActive,
          },
        })
      )
    );
  } catch (error) {
    if (error instanceof Error) {
      return mutationError(error.message);
    }

    throw error;
  }

  revalidateBarberViews();
  return mutationSuccess(
    "Disponibilidade da semana salva com sucesso."
  );
}

export async function createBarberBlockAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const startDateTime = new Date(String(formData.get("startDateTime") || ""));
  const endDateTime = new Date(String(formData.get("endDateTime") || ""));
  const reason = String(formData.get("reason") || "").trim();

  if (
    Number.isNaN(startDateTime.getTime()) ||
    Number.isNaN(endDateTime.getTime()) ||
    startDateTime >= endDateTime
  ) {
    return mutationError("Periodo de bloqueio invalido.");
  }

  await prisma.barberBlock.create({
    data: {
      barberId: barber.id,
      startDateTime,
      endDateTime,
      reason: reason || null,
    },
  });

  revalidateBarberViews();
  return mutationSuccess("Bloqueio criado com sucesso.");
}

export async function createRecurringBarberBlockAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const weekDay = Number(formData.get("weekDay") || -1);
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (weekDay < 0 || weekDay > 6 || !isValidTimeRange(startTime, endTime)) {
    return mutationError("Bloqueio recorrente invalido.");
  }

  await prisma.recurringBarberBlock.create({
    data: {
      barberId: barber.id,
      weekDay,
      startTime,
      endTime,
      reason: reason || null,
      isActive: true,
    },
  });

  revalidateBarberViews();
  return mutationSuccess(
    "Bloqueio recorrente criado com sucesso."
  );
}

export async function deleteRecurringBarberBlockAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const recurringBlockId = String(formData.get("recurringBlockId") || "");

  const recurringBlock = await prisma.recurringBarberBlock.findUnique({
    where: { id: recurringBlockId },
  });

  if (!recurringBlock || recurringBlock.barberId !== barber.id) {
    return mutationError(
      "Bloqueio recorrente nao encontrado para este barbeiro."
    );
  }

  await prisma.recurringBarberBlock.delete({
    where: { id: recurringBlockId },
  });

  revalidateBarberViews();
  return mutationSuccess("Bloqueio recorrente removido.");
}

export async function deleteBarberBlockAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const blockId = String(formData.get("blockId") || "");

  const block = await prisma.barberBlock.findUnique({
    where: { id: blockId },
  });

  if (!block || block.barberId !== barber.id) {
    return mutationError("Bloqueio nao encontrado para este barbeiro.");
  }

  await prisma.barberBlock.delete({
    where: { id: blockId },
  });

  revalidateBarberViews();
  return mutationSuccess("Bloqueio removido.");
}

export async function saveClientNoteAction(
  formData: FormData
): Promise<MutationResult> {
  const barber = await requireBarber();
  const customerId = String(formData.get("customerId") || "");
  const note = String(formData.get("note") || "").trim();

  if (!customerId || !note) {
    return mutationError("Anotacao invalida.");
  }

  const hasAppointment = await prisma.appointment.findFirst({
    where: {
      barberId: barber.id,
      customerId,
    },
    select: {
      id: true,
    },
  });

  if (!hasAppointment) {
    return mutationError("Cliente nao vinculado a este barbeiro.");
  }

  await prisma.clientNote.upsert({
    where: {
      barberId_customerId: {
        barberId: barber.id,
        customerId,
      },
    },
    update: {
      note,
    },
    create: {
      barberId: barber.id,
      customerId,
      note,
    },
  });

  revalidateBarberViews();
  revalidatePath(`/barber/clientes/${customerId}`);
  return mutationSuccess("Observacao salva com sucesso.");
}
