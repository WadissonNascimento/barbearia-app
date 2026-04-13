"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";

export async function cancelCustomerAppointmentAction(
  formData: FormData
): Promise<MutationResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return mutationError("Entre como cliente para cancelar o agendamento.");
  }

  const appointmentId = String(formData.get("appointmentId") || "").trim();

  if (!appointmentId) {
    return mutationError("Agendamento invalido.");
  }

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
    },
    select: {
      customerId: true,
      status: true,
      date: true,
    },
  });

  if (!appointment || appointment.customerId !== session.user.id) {
    return mutationError("Agendamento nao encontrado para sua conta.");
  }

  if (["CANCELLED", "COMPLETED", "DONE", "NO_SHOW"].includes(appointment.status)) {
    return mutationError("Esse agendamento nao pode mais ser cancelado.");
  }

  if (appointment.date.getTime() <= Date.now()) {
    return mutationError(
      "Esse horario ja passou. Fale com o barbeiro para ajustar o status."
    );
  }

  await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: "CANCELLED",
      notes: "Cancelado pelo cliente.",
    },
  });

  revalidatePath("/customer/agendamentos");
  revalidatePath("/customer");
  revalidatePath("/agendar");
  revalidatePath("/admin/agenda");
  revalidatePath("/barber");
  revalidatePath("/barber/agenda");

  return mutationSuccess("Agendamento cancelado com sucesso.");
}
