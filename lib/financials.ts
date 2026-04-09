import { prisma } from "@/lib/prisma";

export type FinancialServiceInput = {
  price: number;
  commissionType?: string | null;
  commissionValue?: number | null;
};

export function calculateServiceFinancials(service: FinancialServiceInput) {
  const commissionType = service.commissionType || "PERCENT";
  const commissionValue = Math.max(0, service.commissionValue || 0);
  const price = Math.max(0, service.price || 0);

  const barberPayout =
    commissionType === "FIXED"
      ? Math.min(price, commissionValue)
      : price * (commissionValue / 100);

  const normalizedPayout = Number(barberPayout.toFixed(2));
  const shopRevenue = Number((price - normalizedPayout).toFixed(2));

  return {
    commissionType,
    commissionValue,
    barberPayout: normalizedPayout,
    shopRevenue,
  };
}

export async function syncAppointmentFinancialSnapshots(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!appointment) {
    throw new Error("Agendamento nao encontrado.");
  }

  await prisma.$transaction(
    appointment.services.map((item) => {
      const financials = calculateServiceFinancials({
        price: item.priceSnapshot,
        commissionType: item.commissionTypeSnapshot || item.service.commissionType,
        commissionValue: item.commissionValueSnapshot || item.service.commissionValue,
      });

      return prisma.appointmentService.update({
        where: { id: item.id },
        data: {
          commissionTypeSnapshot: financials.commissionType,
          commissionValueSnapshot: financials.commissionValue,
          barberPayoutSnapshot: financials.barberPayout,
          shopRevenueSnapshot: financials.shopRevenue,
        },
      });
    })
  );
}

export function getWeekRange(baseDate = new Date()) {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export function getMonthRange(baseDate = new Date()) {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}
