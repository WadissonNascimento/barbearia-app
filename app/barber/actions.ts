"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAppointmentStatusAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  if (session.user.role !== "BARBER") {
    throw new Error("Apenas barbeiros podem fazer isso");
  }

  const appointmentId = String(formData.get("appointmentId") || "");
  const status = String(formData.get("status") || "");

  if (!appointmentId || !status) {
    throw new Error("Dados inválidos");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Agendamento não encontrado");
  }

  // 🔒 segurança: barbeiro só mexe nos dele
  if (appointment.barberId !== session.user.id) {
    throw new Error("Você não pode alterar esse agendamento");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidatePath("/barber");
  revalidatePath("/admin/agenda");
}