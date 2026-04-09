"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildFeedbackRedirect } from "@/lib/pageFeedback";
import { prisma } from "@/lib/prisma";
import {
  getBarberPayoutSnapshot,
  getFinanceDashboardData,
  resolveFinanceRange,
} from "@/lib/financeReports";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }
}

function buildFinanceRedirect(
  formData: FormData,
  message: string,
  tone: "success" | "error" | "info" = "success"
) {
  const period = String(formData.get("period") || "month");
  const start = String(formData.get("start") || "");
  const end = String(formData.get("end") || "");
  const historyStart = String(formData.get("historyStart") || "");
  const historyEnd = String(formData.get("historyEnd") || "");
  const compareMode = String(formData.get("compareMode") || "auto");
  const compareStart = String(formData.get("compareStart") || "");
  const compareEnd = String(formData.get("compareEnd") || "");
  const params = new URLSearchParams();

  if (period) params.set("period", period);
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  if (historyStart) params.set("historyStart", historyStart);
  if (historyEnd) params.set("historyEnd", historyEnd);
  if (compareMode) params.set("compareMode", compareMode);
  if (compareStart) params.set("compareStart", compareStart);
  if (compareEnd) params.set("compareEnd", compareEnd);

  const base = `/admin/financeiro${params.toString() ? `?${params.toString()}` : ""}`;
  return buildFeedbackRedirect(base, message, tone);
}

export async function generateBarberPayoutsAction(formData: FormData) {
  await requireAdmin();

  const range = resolveFinanceRange({
    period: String(formData.get("period") || "month") as "week" | "month" | "custom",
    start: String(formData.get("start") || ""),
    end: String(formData.get("end") || ""),
  });

  const dashboard = await getFinanceDashboardData({
    period: range.period,
    start: range.start.toISOString().slice(0, 10),
    end: range.end.toISOString().slice(0, 10),
    compareMode: String(formData.get("compareMode") || "auto") as "auto" | "custom",
    compareStart: String(formData.get("compareStart") || ""),
    compareEnd: String(formData.get("compareEnd") || ""),
  });

  await prisma.$transaction(
    dashboard.barberPayouts.map((item) =>
      prisma.barberPayout.upsert({
        where: {
          barberId_periodStart_periodEnd: {
            barberId: item.barberId,
            periodStart: range.start,
            periodEnd: range.end,
          },
        },
        update: {
          grossRevenue: item.grossRevenue,
          commissionTotal: item.commissionTotal,
          shopNetRevenue: item.shopNetRevenue,
          status: item.savedStatus === "PAID" ? "PAID" : "CLOSED",
        },
        create: {
          barberId: item.barberId,
          periodStart: range.start,
          periodEnd: range.end,
          grossRevenue: item.grossRevenue,
          commissionTotal: item.commissionTotal,
          shopNetRevenue: item.shopNetRevenue,
          status: "CLOSED",
        },
      })
    )
  );

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  redirect(buildFinanceRedirect(formData, "Fechamento financeiro gerado com sucesso."));
}

export async function markBarberPayoutAsPaidAction(formData: FormData) {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") || "");

  if (!payoutId) {
    redirect(buildFinanceRedirect(formData, "Fechamento invalido.", "error"));
  }

  await prisma.barberPayout.update({
    where: { id: payoutId },
    data: {
      status: "PAID",
      paidAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  redirect(buildFinanceRedirect(formData, "Pagamento marcado com sucesso."));
}

export async function reopenBarberPayoutAction(formData: FormData) {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") || "");

  if (!payoutId) {
    redirect(buildFinanceRedirect(formData, "Fechamento invalido.", "error"));
  }

  await prisma.barberPayout.update({
    where: { id: payoutId },
    data: {
      status: "OPEN",
      paidAt: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  redirect(buildFinanceRedirect(formData, "Fechamento reaberto para revisao.", "info"));
}

export async function closeBarberPayoutAction(formData: FormData) {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") || "");

  if (!payoutId) {
    redirect(buildFinanceRedirect(formData, "Fechamento invalido.", "error"));
  }

  const payout = await prisma.barberPayout.findUnique({
    where: { id: payoutId },
  });

  if (!payout) {
    redirect(buildFinanceRedirect(formData, "Fechamento nao encontrado.", "error"));
  }

  const snapshot = await getBarberPayoutSnapshot({
    barberId: payout.barberId,
    periodStart: payout.periodStart,
    periodEnd: payout.periodEnd,
  });

  await prisma.barberPayout.update({
    where: { id: payoutId },
    data: {
      grossRevenue: snapshot.grossRevenue,
      commissionTotal: snapshot.commissionTotal,
      shopNetRevenue: snapshot.shopNetRevenue,
      status: "CLOSED",
      paidAt: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  redirect(buildFinanceRedirect(formData, "Fechamento atualizado e fechado novamente."));
}

export async function deleteBarberPayoutAction(formData: FormData) {
  await requireAdmin();

  const payoutId = String(formData.get("payoutId") || "");

  if (!payoutId) {
    redirect(buildFinanceRedirect(formData, "Fechamento invalido.", "error"));
  }

  const payout = await prisma.barberPayout.findUnique({
    where: { id: payoutId },
    select: { id: true },
  });

  if (!payout) {
    redirect(buildFinanceRedirect(formData, "Fechamento nao encontrado.", "error"));
  }

  await prisma.barberPayout.delete({
    where: { id: payoutId },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");
  redirect(buildFinanceRedirect(formData, "Fechamento excluido com sucesso."));
}
