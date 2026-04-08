import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppUrl } from "@/lib/utils";

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

    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id: parsed.service }, { name: parsed.service }],
        isActive: true,
      },
    });

    if (!barber || !service) {
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

    const existing = await prisma.appointment.findFirst({
      where: {
        barberId: barber.id,
        date: appointmentDate,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
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
        serviceId: service.id,
        date: appointmentDate,
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
