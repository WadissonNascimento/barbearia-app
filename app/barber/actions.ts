"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  APPOINTMENT_STATUSES,
  normalizeAppointmentStatus,
} from "@/lib/appointmentStatus";
import { syncAppointmentFinancialSnapshots } from "@/lib/financials";
import { buildFeedbackRedirect } from "@/lib/pageFeedback";
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
  revalidatePath("/barber/clientes");
  revalidatePath("/agendar");
  revalidatePath("/customer");
  revalidatePath("/admin/agenda");
}

function getRedirectTo(formData: FormData, fallback: string) {
  const redirectTo = String(formData.get("redirectTo") || "").trim();
  return redirectTo || fallback;
}

function redirectWithFeedback(
  formData: FormData,
  fallback: string,
  message: string,
  tone: "error" | "success" | "info" = "success"
): never {
  redirect(buildFeedbackRedirect(getRedirectTo(formData, fallback), message, tone));
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const barber = await requireBarber();
  const appointmentId = String(formData.get("appointmentId") || "");
  const status = normalizeAppointmentStatus(
    String(formData.get("status") || "")
  );

  if (!appointmentId || !APPOINTMENT_STATUSES.includes(status as never)) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Status de agendamento invalido.",
      "error"
    );
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Agendamento nao encontrado para este barbeiro.",
      "error"
    );
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  if (status === "COMPLETED") {
    await syncAppointmentFinancialSnapshots(appointmentId);
  }

  revalidateBarberViews();
  redirectWithFeedback(formData, "/barber", "Status do agendamento atualizado.");
}

export async function createBarberServiceAction(formData: FormData) {
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
    redirectWithFeedback(
      formData,
      "/barber",
      "Preencha nome, preco, duracao e intervalo corretamente.",
      "error"
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
  redirectWithFeedback(formData, "/barber", "Servico criado com sucesso.");
}

export async function updateBarberServiceAction(formData: FormData) {
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
    redirectWithFeedback(
      formData,
      "/barber",
      "Preencha nome, preco, duracao e intervalo corretamente.",
      "error"
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Servico nao encontrado para este barbeiro.",
      "error"
    );
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
  redirectWithFeedback(formData, "/barber", "Servico atualizado com sucesso.");
}

export async function toggleBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Servico nao encontrado para este barbeiro.",
      "error"
    );
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      isActive: !service.isActive,
    },
  });

  revalidateBarberViews();
  redirectWithFeedback(
    formData,
    "/barber",
    service.isActive ? "Servico desativado." : "Servico ativado."
  );
}

export async function deleteBarberServiceAction(formData: FormData) {
  const barber = await requireBarber();
  const serviceId = String(formData.get("serviceId") || "");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service || service.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Servico nao encontrado para este barbeiro.",
      "error"
    );
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidateBarberViews();
  redirectWithFeedback(formData, "/barber", "Servico removido com sucesso.");
}

export async function saveBarberAvailabilityAction(formData: FormData) {
  const barber = await requireBarber();
  const weekDay = Number(formData.get("weekDay") || -1);
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const isActive = String(formData.get("isActive") || "false") === "true";

  if (weekDay < 0 || weekDay > 6 || !isValidTimeRange(startTime, endTime)) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Disponibilidade invalida.",
      "error"
    );
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
  redirectWithFeedback(formData, "/barber", "Disponibilidade atualizada.");
}

export async function saveWeeklyBarberAvailabilityAction(formData: FormData) {
  const barber = await requireBarber();

  const entries = Array.from({ length: 7 }, (_, weekDay) => {
    const startTime = String(formData.get(`day-${weekDay}-startTime`) || "");
    const endTime = String(formData.get(`day-${weekDay}-endTime`) || "");
    const isActive =
      String(formData.get(`day-${weekDay}-isActive`) || "false") === "true";

    if (!isValidTimeRange(startTime, endTime)) {
      redirectWithFeedback(
        formData,
        "/barber",
        `Horario invalido para o dia ${weekDay}.`,
        "error"
      );
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
  redirectWithFeedback(
    formData,
    "/barber",
    "Disponibilidade da semana salva com sucesso."
  );
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
    redirectWithFeedback(
      formData,
      "/barber",
      "Periodo de bloqueio invalido.",
      "error"
    );
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
  redirectWithFeedback(formData, "/barber", "Bloqueio criado com sucesso.");
}

export async function createRecurringBarberBlockAction(formData: FormData) {
  const barber = await requireBarber();
  const weekDay = Number(formData.get("weekDay") || -1);
  const startTime = String(formData.get("startTime") || "");
  const endTime = String(formData.get("endTime") || "");
  const reason = String(formData.get("reason") || "").trim();

  if (weekDay < 0 || weekDay > 6 || !isValidTimeRange(startTime, endTime)) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Bloqueio recorrente invalido.",
      "error"
    );
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
  redirectWithFeedback(
    formData,
    "/barber",
    "Bloqueio recorrente criado com sucesso."
  );
}

export async function deleteRecurringBarberBlockAction(formData: FormData) {
  const barber = await requireBarber();
  const recurringBlockId = String(formData.get("recurringBlockId") || "");

  const recurringBlock = await prisma.recurringBarberBlock.findUnique({
    where: { id: recurringBlockId },
  });

  if (!recurringBlock || recurringBlock.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Bloqueio recorrente nao encontrado para este barbeiro.",
      "error"
    );
  }

  await prisma.recurringBarberBlock.delete({
    where: { id: recurringBlockId },
  });

  revalidateBarberViews();
  redirectWithFeedback(formData, "/barber", "Bloqueio recorrente removido.");
}

export async function deleteBarberBlockAction(formData: FormData) {
  const barber = await requireBarber();
  const blockId = String(formData.get("blockId") || "");

  const block = await prisma.barberBlock.findUnique({
    where: { id: blockId },
  });

  if (!block || block.barberId !== barber.id) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Bloqueio nao encontrado para este barbeiro.",
      "error"
    );
  }

  await prisma.barberBlock.delete({
    where: { id: blockId },
  });

  revalidateBarberViews();
  redirectWithFeedback(formData, "/barber", "Bloqueio removido.");
}

export async function saveClientNoteAction(formData: FormData) {
  const barber = await requireBarber();
  const customerId = String(formData.get("customerId") || "");
  const note = String(formData.get("note") || "").trim();

  if (!customerId || !note) {
    redirectWithFeedback(
      formData,
      "/barber",
      "Anotacao invalida.",
      "error"
    );
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
    redirectWithFeedback(
      formData,
      "/barber",
      "Cliente nao vinculado a este barbeiro.",
      "error"
    );
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
  redirectWithFeedback(
    formData,
    `/barber/clientes/${customerId}`,
    "Observacao salva com sucesso."
  );
}
