"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

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
    throw new Error("Barbeiro, serviço, data e horário são obrigatórios.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
      isActive: true,
    },
  });

  if (!barber) {
    throw new Error("Barbeiro inválido ou inativo.");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("Serviço inválido ou inativo.");
  }

  const appointmentDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Data ou horário inválido.");
  }

  const now = new Date();
  if (appointmentDate.getTime() <= now.getTime()) {
    throw new Error("Não é possível agendar em data ou horário que já passou.");
  }

  const selectedStartMinutes = toMinutes(time);
  const selectedEndMinutes = selectedStartMinutes + service.duration;

  const sameDayAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date: {
        gte: new Date(`${date}T00:00:00`),
        lte: new Date(`${date}T23:59:59.999`),
      },
      status: {
        not: "CANCELLED",
      },
    },
    include: {
      service: true,
    },
  });

  const conflict = sameDayAppointments.some((appointment) => {
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
    throw new Error("Esse horário não está mais disponível.");
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
