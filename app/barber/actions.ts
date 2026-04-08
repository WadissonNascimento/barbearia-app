"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  APPOINTMENT_STATUSES,
  normalizeAppointmentStatus,
} from "@/lib/appointmentStatus";

async function requireBarber() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "BARBER") {
    throw new Error("Nao autorizado.");
  }

  return session.user;
}

function isValidTimeRange(startTime: string, endTime: string) {
  return /^\d{2}:\d{2}$/.test(startTime) &&
    /^\d{2}:\d{2}$/.test(endTime) &&
    startTime < endTime;
}

function revalidateBarberViews() {
  revalidatePath("/barber");
  revalidatePath("/barber/clientes");
  revalidatePath("/agendar");
  revalidatePath("/customer");
  revalidatePath("/admin/agenda");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const barber = await requireBarber();
  const appointmentId = String(formData.get("appointmentId") || "");
  const status = normalizeAppointmentStatus(
    String(formData.get("status") || "")
  );

  if (!appointmentId || !APPOINTMENT_STATUSES.includes(status as never)) {
    throw new Error("Status de agendamento invalido.");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.barberId !== barber.id) {
    throw new Error("Agendamento nao encontrado para este barbeiro.");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidateBarberViews();
}

export async function createBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);

  if (!name || price <= 0 || duration <= 0) {
    throw new Error("Preencha nome, preco e duracao corretamente.");
  }

  await prisma.service.create({
    data: {
      barberId: barber.id,
      name,
      description: description || null,
      price,
      duration,
      isActive: true,
    },
  });

  revalidateBarberViews();
}

export async function updateBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);

  if (!serviceId || !name || price <= 0 || duration <= 0) {
    throw new Error("Preencha nome, preco e duracao corretamente.");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    throw new Error("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      description: description || null,
      price,
      duration,
    },
  });

  revalidateBarberViews();
}

export async function toggleBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    throw new Error("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      isActive: !service.isActive,
    },
  });

  revalidateBarberViews();
}

export async function deleteBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    throw new Error("Servico nao encontrado para este barbeiro.");
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidateBarberViews();
}

export async function saveBarberAvailabilityAction(formData: FormData) {
  const barber = await requireBarber();
  const weekDay = Number(formData.get("weekDay") || -1);
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const isActive = String(formData.get("isActive") || "false") === "true";

  if (weekDay < 0 || weekDay > 6 || !isValidTimeRange(startTime, endTime)) {
    throw new Error("Disponibilidade invalida.");
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
}

export async function saveWeeklyBarberAvailabilityAction(formData: FormData) {
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

  revalidateBarberViews();
}

export async function createBarberBlockAction(formData: FormData) {
  const barber = await requireBarber();
  const startDateTime = new Date(String(formData.get("startDateTime") || ""));
  const endDateTime = new Date(String(formData.get("endDateTime") || ""));
  const reason = String(formData.get("reason") || "").trim();

  if (
    Number.isNaN(startDateTime.getTime()) ||
    Number.isNaN(endDateTime.getTime()) ||
    startDateTime >= endDateTime
  ) {
    throw new Error("Periodo de bloqueio invalido.");
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
}

export async function deleteBarberBlockAction(formData: FormData) {
  const barber = await requireBarber();
  const blockId = String(formData.get("blockId") || "");

  const block = await prisma.barberBlock.findUnique({
    where: { id: blockId },
  });

  if (!block || block.barberId !== barber.id) {
    throw new Error("Bloqueio nao encontrado para este barbeiro.");
  }

  await prisma.barberBlock.delete({
    where: { id: blockId },
  });

  revalidateBarberViews();
}

export async function saveClientNoteAction(formData: FormData) {
  const barber = await requireBarber();
  const customerId = String(formData.get("customerId") || "");
  const note = String(formData.get("note") || "").trim();

  if (!customerId || !note) {
    throw new Error("Anotacao invalida.");
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
    throw new Error("Cliente nao vinculado a este barbeiro.");
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
}
