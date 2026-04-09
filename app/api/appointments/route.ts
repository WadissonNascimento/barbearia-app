import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl } from "@/lib/utils";
import {
  getAppointmentServicesOccupiedDuration,
  isActiveAppointmentStatus,
  isBlockedPeriod,
  toMinutes,
} from "@/lib/barberSchedule";
import { calculateServiceFinancials } from "@/lib/financials";

const appointmentSchema = z.object({
  customer: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  service: z.string().min(2),
  barber: z.string().min(2),
  date: z.string().min(10),
  time: z.string().min(4),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = appointmentSchema.parse(body);

    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date < today) {
      return NextResponse.json(
        { message: "Nao e possivel agendar em uma data passada." },
        { status: 400 }
      );
    }

    const barber = await prisma.user.findFirst({
      where: {
        OR: [{ id: parsed.barber }, { name: parsed.barber }],
        role: "BARBER",
        isActive: true,
      },
    });

    if (!barber) {
      return NextResponse.json(
        { message: "Barbeiro invalido ou inativo." },
        { status: 400 }
      );
    }

    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id: parsed.service }, { name: parsed.service }],
        AND: [
          {
            OR: [{ barberId: barber.id }, { barberId: null }],
          },
        ],
        isActive: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { message: "Barbeiro ou servico invalido." },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(`${parsed.date}T${parsed.time}:00`);
    if (Number.isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        { message: "Data ou horario invalido." },
        { status: 400 }
      );
    }

    const dayStart = new Date(`${parsed.date}T00:00:00`);
    const dayEnd = new Date(`${parsed.date}T23:59:59.999`);
    const dayOfWeek = new Date(`${parsed.date}T00:00:00`).getDay();

    const [availability, sameDayAppointments, blocks] = await Promise.all([
      prisma.barberAvailability.findFirst({
        where: {
          barberId: barber.id,
          weekDay: dayOfWeek,
          isActive: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          barberId: barber.id,
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
          barberId: barber.id,
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
      return NextResponse.json(
        { message: "Esse barbeiro nao atende nesse dia." },
        { status: 400 }
      );
    }

    const selectedStartMinutes = toMinutes(parsed.time);
    const selectedEndMinutes =
      selectedStartMinutes +
      getAppointmentServicesOccupiedDuration([
        {
          durationSnapshot: service.duration,
          bufferAfter: service.bufferAfter,
        },
      ]);
    const availabilityStart = toMinutes(availability.startTime);
    const availabilityEnd = toMinutes(availability.endTime);

    if (
      selectedStartMinutes < availabilityStart ||
      selectedEndMinutes > availabilityEnd
    ) {
      return NextResponse.json(
        { message: "Horario fora da disponibilidade do barbeiro." },
        { status: 400 }
      );
    }

    const endDate = new Date(appointmentDate.getTime() + service.duration * 60000);
    if (isBlockedPeriod(appointmentDate, endDate, blocks)) {
      return NextResponse.json(
        { message: "Horario bloqueado pelo barbeiro." },
        { status: 400 }
      );
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
      return NextResponse.json(
        { message: "Esse horario ja esta ocupado para esse barbeiro." },
        { status: 400 }
      );
    }

    const customerEmail =
      parsed.email || `${parsed.phone.replace(/\D/g, "")}@guest.local`;

    let customer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: parsed.customer,
          email: customerEmail,
          phone: parsed.phone,
          role: "CUSTOMER",
          isActive: true,
        },
      });
    }

    const message = `Novo agendamento
Cliente: ${parsed.customer}
Servico: ${service.name}
Barbeiro: ${barber.name}
Data: ${parsed.date}
Horario: ${parsed.time}
Telefone: ${parsed.phone}${parsed.notes ? `\nObs: ${parsed.notes}` : ""}`;
    const whatsappUrl = buildWhatsAppUrl(message);

    await prisma.appointment.create({
      data: {
        customerId: customer.id,
        barberId: barber.id,
        date: appointmentDate,
        services: {
          create: (() => {
            const financials = calculateServiceFinancials(service);

            return [
              {
                serviceId: service.id,
                orderIndex: 0,
                nameSnapshot: service.name,
                priceSnapshot: service.price,
                durationSnapshot: service.duration,
                bufferAfter: service.bufferAfter || 0,
                commissionTypeSnapshot: financials.commissionType,
                commissionValueSnapshot: financials.commissionValue,
                barberPayoutSnapshot: financials.barberPayout,
                shopRevenueSnapshot: financials.shopRevenue,
              },
            ];
          })(),
        },
        notes: parsed.notes || `Contato: ${whatsappUrl}`,
      },
    });

    return NextResponse.json({
      message: "Agendamento confirmado com sucesso.",
      whatsappUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Nao foi possivel concluir o agendamento.",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
