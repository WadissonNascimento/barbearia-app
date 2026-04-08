"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  isActiveAppointmentStatus,
  isBlockedPeriod,
  toMinutes,
} from "@/lib/barberSchedule";

export async function createAppointmentAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const barberId = String(formData.get("barberId") || "");
  const serviceId = String(formData.get("serviceId") || "");
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!barberId || !serviceId || !date || !time) {
    throw new Error("Barbeiro, servico, data e horario sao obrigatorios.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
      isActive: true,
    },
  });

  if (!barber) {
    throw new Error("Barbeiro invalido ou inativo.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      OR: [{ barberId }, { barberId: null }],
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("Servico invalido ou indisponivel para este barbeiro.");
  }

  const appointmentDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Data ou horario invalido.");
  }

  const now = new Date();
  if (appointmentDate.getTime() <= now.getTime()) {
    throw new Error("Nao e possivel agendar em data ou horario que ja passou.");
  }

  const selectedDay = new Date(`${date}T00:00:00`);
  const dayOfWeek = selectedDay.getDay();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const [availability, sameDayAppointments, blocks] = await Promise.all([
    prisma.barberAvailability.findFirst({
      where: {
        barberId,
        weekDay: dayOfWeek,
        isActive: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        barberId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        service: true,
      },
    }),
    prisma.barberBlock.findMany({
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
  ]);

  if (!availability) {
    throw new Error("Este barbeiro nao atende nesse dia.");
  }

  const selectedStartMinutes = toMinutes(time);
  const selectedEndMinutes = selectedStartMinutes + service.duration;
  const availabilityStart = toMinutes(availability.startTime);
  const availabilityEnd = toMinutes(availability.endTime);

  if (
    selectedStartMinutes < availabilityStart ||
    selectedEndMinutes > availabilityEnd
  ) {
    throw new Error("O horario escolhido esta fora da disponibilidade do barbeiro.");
  }

  const endDate = new Date(appointmentDate.getTime() + service.duration * 60000);
  if (isBlockedPeriod(appointmentDate, endDate, blocks)) {
    throw new Error("O horario escolhido esta bloqueado pelo barbeiro.");
  }

  const conflict = sameDayAppointments.some((appointment) => {
    if (!isActiveAppointmentStatus(appointment.status)) {
      return false;
    }

    const existingDate = new Date(appointment.date);
    const existingStartMinutes =
      existingDate.getHours() * 60 + existingDate.getMinutes();
    const existingEndMinutes =
      existingStartMinutes + appointment.service.duration;

    return (
      selectedStartMinutes < existingEndMinutes &&
      selectedEndMinutes > existingStartMinutes
    );
  });

  if (conflict) {
    throw new Error("Esse horario nao esta mais disponivel.");
  }

  await prisma.appointment.create({
    data: {
      barberId,
      customerId: session.user.id,
      serviceId,
      date: appointmentDate,
      notes: notes || null,
      status: "PENDING",
    },
  });

  revalidatePath("/customer");
  revalidatePath("/barber");
  revalidatePath("/admin/agenda");
  revalidatePath("/agendar");

  redirect("/customer");
}
