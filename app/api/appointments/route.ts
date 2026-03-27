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
  notes: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = appointmentSchema.parse(body);

    const today = new Date().toISOString().slice(0, 10);
    if (parsed.date < today) {
      return NextResponse.json({ message: "Não é possível agendar em uma data passada." }, { status: 400 });
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        barber: parsed.barber,
        date: parsed.date,
        time: parsed.time,
        status: { not: "cancelado" }
      }
    });

    if (existing) {
      return NextResponse.json({ message: "Esse horário já está ocupado para esse barbeiro." }, { status: 400 });
    }

    const message = `Novo agendamento
Cliente: ${parsed.customer}
Serviço: ${parsed.service}
Barbeiro: ${parsed.barber}
Data: ${parsed.date}
Horário: ${parsed.time}
Telefone: ${parsed.phone}${parsed.notes ? `\nObs: ${parsed.notes}` : ""}`;
    const whatsappUrl = buildWhatsAppUrl(message);

    await prisma.appointment.create({
      data: {
        customer: parsed.customer,
        phone: parsed.phone,
        email: parsed.email || null,
        service: parsed.service,
        barber: parsed.barber,
        date: parsed.date,
        time: parsed.time,
        notes: parsed.notes,
        whatsappUrl
      }
    });

    return NextResponse.json({
      message: "Agendamento confirmado com sucesso.",
      whatsappUrl
    });
  } catch (error) {
    return NextResponse.json({ message: "Não foi possível concluir o agendamento.", error: String(error) }, { status: 500 });
  }
}
