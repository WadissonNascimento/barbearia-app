import { prisma } from "@/lib/prisma";
import {
  getAppointmentDisplayName,
  getAppointmentTotalPrice,
} from "@/lib/appointmentServices";
import { normalizeAppointmentStatus } from "@/lib/appointmentStatus";
import { getMonthRange, getWeekRange } from "@/lib/financials";

function getStartOfDay() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export async function getAdminDashboardData() {
  const startOfDay = getStartOfDay();
  const weekRange = getWeekRange();
  const monthRange = getMonthRange();

  const [appointments, orders] = await Promise.all([
    prisma.appointment.findMany({
      include: {
        barber: true,
        services: true,
      },
    }),
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
  ]);

  const normalizedAppointments = appointments.map((appointment) => ({
    ...appointment,
    status: normalizeAppointmentStatus(appointment.status),
  }));

  const completedAppointments = normalizedAppointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  );
  const cancelledAppointments = normalizedAppointments.filter(
    (appointment) =>
      appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
  );

  const serviceRevenue = completedAppointments.reduce(
    (sum, appointment) => sum + getAppointmentTotalPrice(appointment.services),
    0
  );
  const totalBarberPayout = completedAppointments.reduce(
    (sum, appointment) =>
      sum +
      appointment.services.reduce(
        (servicesSum, service) => servicesSum + service.barberPayoutSnapshot,
        0
      ),
    0
  );
  const totalShopNetRevenue = completedAppointments.reduce(
    (sum, appointment) =>
      sum +
      appointment.services.reduce(
        (servicesSum, service) => servicesSum + service.shopRevenueSnapshot,
        0
      ),
    0
  );
  const ordersRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.total, 0);

  const completedThisWeek = completedAppointments.filter(
    (appointment) =>
      appointment.date >= weekRange.start && appointment.date <= weekRange.end
  );
  const completedThisMonth = completedAppointments.filter(
    (appointment) =>
      appointment.date >= monthRange.start && appointment.date <= monthRange.end
  );

  const weeklyServiceRevenue = completedThisWeek.reduce(
    (sum, appointment) => sum + getAppointmentTotalPrice(appointment.services),
    0
  );
  const monthlyServiceRevenue = completedThisMonth.reduce(
    (sum, appointment) => sum + getAppointmentTotalPrice(appointment.services),
    0
  );
  const weeklyBarberPayout = completedThisWeek.reduce(
    (sum, appointment) =>
      sum +
      appointment.services.reduce(
        (servicesSum, service) => servicesSum + service.barberPayoutSnapshot,
        0
      ),
    0
  );
  const monthlyBarberPayout = completedThisMonth.reduce(
    (sum, appointment) =>
      sum +
      appointment.services.reduce(
        (servicesSum, service) => servicesSum + service.barberPayoutSnapshot,
        0
      ),
    0
  );

  const barberCount = new Map<string, { name: string; count: number }>();
  const serviceCount = new Map<string, number>();
  const productCount = new Map<string, number>();

  for (const appointment of normalizedAppointments) {
    const current = barberCount.get(appointment.barberId) || {
      name: appointment.barber.name || "Barbeiro",
      count: 0,
    };
    current.count += 1;
    barberCount.set(appointment.barberId, current);

    serviceCount.set(
      getAppointmentDisplayName(appointment.services),
      (serviceCount.get(getAppointmentDisplayName(appointment.services)) || 0) + 1
    );
  }

  for (const order of orders) {
    for (const item of order.items) {
      productCount.set(
        item.product.name,
        (productCount.get(item.product.name) || 0) + item.quantity
      );
    }
  }

  const topBarber = Array.from(barberCount.values()).sort(
    (a, b) => b.count - a.count
  )[0] || null;
  const topService = Array.from(serviceCount.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0] || null;
  const topProduct = Array.from(productCount.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0] || null;

  const upcomingAppointments = normalizedAppointments
    .filter((appointment) => appointment.date >= startOfDay)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const pendingOrders = orders
    .filter((order) => order.status === "PENDING")
    .slice(0, 5);

  const barberFinancialMap = new Map<
    string,
    {
      barberId: string;
      barberName: string;
      weeklyRevenue: number;
      weeklyPayout: number;
      weeklyNet: number;
      monthlyRevenue: number;
      monthlyPayout: number;
      monthlyNet: number;
      weeklyAppointments: number;
      monthlyAppointments: number;
    }
  >();

  for (const appointment of completedAppointments) {
    const current = barberFinancialMap.get(appointment.barberId) || {
      barberId: appointment.barberId,
      barberName: appointment.barber.name || "Barbeiro",
      weeklyRevenue: 0,
      weeklyPayout: 0,
      weeklyNet: 0,
      monthlyRevenue: 0,
      monthlyPayout: 0,
      monthlyNet: 0,
      weeklyAppointments: 0,
      monthlyAppointments: 0,
    };

    const appointmentRevenue = getAppointmentTotalPrice(appointment.services);
    const appointmentPayout = appointment.services.reduce(
      (sum, service) => sum + service.barberPayoutSnapshot,
      0
    );
    const appointmentNet = appointment.services.reduce(
      (sum, service) => sum + service.shopRevenueSnapshot,
      0
    );

    if (appointment.date >= weekRange.start && appointment.date <= weekRange.end) {
      current.weeklyRevenue += appointmentRevenue;
      current.weeklyPayout += appointmentPayout;
      current.weeklyNet += appointmentNet;
      current.weeklyAppointments += 1;
    }

    if (appointment.date >= monthRange.start && appointment.date <= monthRange.end) {
      current.monthlyRevenue += appointmentRevenue;
      current.monthlyPayout += appointmentPayout;
      current.monthlyNet += appointmentNet;
      current.monthlyAppointments += 1;
    }

    barberFinancialMap.set(appointment.barberId, current);
  }

  return {
    metrics: {
      totalRevenue: serviceRevenue + ordersRevenue,
      totalAppointments: normalizedAppointments.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      ordersRevenue,
      serviceRevenue,
      totalBarberPayout,
      totalShopNetRevenue,
      weeklyServiceRevenue,
      monthlyServiceRevenue,
      weeklyBarberPayout,
      monthlyBarberPayout,
    },
    highlights: {
      topBarber,
      topService,
      topProduct,
    },
    upcomingAppointments,
    pendingOrders,
    barberFinancials: Array.from(barberFinancialMap.values()).sort(
      (a, b) => b.monthlyRevenue - a.monthlyRevenue
    ),
  };
}
