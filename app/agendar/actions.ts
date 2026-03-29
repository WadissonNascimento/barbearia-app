"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createAppointment(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const customer = await prisma.customerProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    const serviceId = formData.get("serviceId") as string;
    const barberId = formData.get("barberId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const notes = formData.get("notes") as string;

    if (!serviceId || !barberId || !date || !time) {
      throw new Error("Dados incompletos");
    }

    const startTime = time;
    const endTime = time; // simplificado por enquanto

    await prisma.appointment.create({
      data: {
        customerId: customer.id,
        barberId,
        serviceId,
        date,
        startTime,
        endTime,
        status: "PENDING",
        notes,
      },
    });

    redirect("/sucesso");
  } catch (error) {
    console.error("ERRO AGENDAMENTO:", error);
    return "Não foi possível concluir o agendamento.";
  }
}