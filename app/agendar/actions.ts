"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getAppointmentServicesOccupiedDuration,
  isActiveAppointmentStatus,
  isBlockedPeriod,
  isBlockedByRecurringBlock,
  toMinutes,
} from "@/lib/barberSchedule";
import type { FormFeedbackState } from "@/lib/formFeedbackState";
import { calculateServiceFinancials } from "@/lib/financials";
import { prisma } from "@/lib/prisma";

export async function createAppointmentAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const barberId = String(formData.get("barberId") || "");
  const serviceIds = String(formData.get("serviceIds") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!barberId || serviceIds.length === 0 || !date || !time) {
    return {
      error: "Selecione barbeiro, servicos, data e horario para continuar.",
      success: null,
    };
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
      isActive: true,
    },
  });

  if (!barber) {
    return {
      error: "O barbeiro selecionado nao esta mais disponivel.",
      success: null,
    };
  }

  const services = await prisma.service.findMany({
    where: {
      id: {
        in: serviceIds,
      },
      OR: [{ barberId }, { barberId: null }],
      isActive: true,
    },
  });

  if (services.length !== serviceIds.length) {
    return {
      error: "Um ou mais servicos escolhidos nao estao disponiveis para esse barbeiro.",
      success: null,
    };
  }

  const appointmentDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(appointmentDate.getTime())) {
    return {
      error: "Data ou horario invalido.",
      success: null,
    };
  }

  const now = new Date();
  if (appointmentDate.getTime() <= now.getTime()) {
    return {
      error: "Nao e possivel agendar em um horario que ja passou.",
      success: null,
    };
  }

  const selectedDay = new Date(`${date}T00:00:00`);
  const dayOfWeek = selectedDay.getDay();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const [availability, sameDayAppointments, blocks, recurringBlocks] = await Promise.all([
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
        services: true,
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
    prisma.recurringBarberBlock.findMany({
      where: {
        barberId,
        weekDay: dayOfWeek,
        isActive: true,
      },
    }),
  ]);

  if (!availability) {
    return {
      error: "Este barbeiro nao atende nesse dia.",
      success: null,
    };
  }

  const selectedStartMinutes = toMinutes(time);
  const selectedEndMinutes =
    selectedStartMinutes + getAppointmentServicesOccupiedDuration(
      services.map((service) => ({
        durationSnapshot: service.duration,
        bufferAfter: service.bufferAfter,
      }))
    );
  const availabilityStart = toMinutes(availability.startTime);
  const availabilityEnd = toMinutes(availability.endTime);

  if (
    selectedStartMinutes < availabilityStart ||
    selectedEndMinutes > availabilityEnd
  ) {
    return {
      error: "O horario escolhido esta fora da disponibilidade do barbeiro.",
      success: null,
    };
  }

  const endDate = new Date(
    appointmentDate.getTime() +
      getAppointmentServicesOccupiedDuration(
        services.map((service) => ({
          durationSnapshot: service.duration,
          bufferAfter: service.bufferAfter,
        }))
      ) *
        60000
  );
  if (isBlockedPeriod(appointmentDate, endDate, blocks)) {
    return {
      error: "O horario escolhido esta bloqueado pelo barbeiro.",
      success: null,
    };
  }

  if (isBlockedByRecurringBlock(selectedStartMinutes, selectedEndMinutes, recurringBlocks)) {
    return {
      error: "O horario escolhido entra em um bloqueio recorrente do barbeiro.",
      success: null,
    };
  }

  const conflict = sameDayAppointments.some((appointment) => {
    if (!isActiveAppointmentStatus(appointment.status)) {
      return false;
    }

    const existingDate = new Date(appointment.date);
    const existingStartMinutes =
      existingDate.getHours() * 60 + existingDate.getMinutes();
    const existingEndMinutes =
      existingStartMinutes +
      getAppointmentServicesOccupiedDuration(appointment.services);

    return (
      selectedStartMinutes < existingEndMinutes &&
      selectedEndMinutes > existingStartMinutes
    );
  });

  if (conflict) {
    return {
      error: "Esse horario acabou de ser reservado. Escolha outro horario.",
      success: null,
    };
  }

  await prisma.appointment.create({
    data: {
      barberId,
      customerId: session.user.id,
      date: appointmentDate,
      notes: notes || null,
      status: "PENDING",
      services: {
        create: services.map((service, index) => {
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
  });

  revalidatePath("/customer");
  revalidatePath("/barber");
  revalidatePath("/admin/agenda");
  revalidatePath("/agendar");

  redirect("/customer");
}
