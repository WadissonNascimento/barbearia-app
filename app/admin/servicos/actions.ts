"use server";

import { auth } from "@/auth";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }
}

function revalidateServiceViews() {
  revalidatePath("/admin");
  revalidatePath("/admin/servicos");
  revalidatePath("/agendar");
  revalidatePath("/barber");
}

export async function createGlobalServiceAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);
  const commissionValue = Number(formData.get("commissionValue") || 0);

  if (!name || price <= 0 || duration <= 0 || commissionValue < 0 || commissionValue > 100) {
    return mutationError("Preencha nome, preco, duracao e comissao corretamente.");
  }

  await prisma.service.create({
    data: {
      barberId: null,
      name,
      description: description || null,
      price,
      duration,
      commissionType: "PERCENT",
      commissionValue,
      isActive: true,
    },
  });

  revalidateServiceViews();
  return mutationSuccess("Servico geral criado com sucesso.");
}

export async function updateGlobalServiceAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const duration = Number(formData.get("duration") || 0);
  const commissionValue = Number(formData.get("commissionValue") || 0);

  if (
    !serviceId ||
    !name ||
    price <= 0 ||
    duration <= 0 ||
    commissionValue < 0 ||
    commissionValue > 100
  ) {
    return mutationError("Preencha nome, preco, duracao e comissao corretamente.");
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return mutationError("Servico nao encontrado.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name,
      description: description || null,
      price,
      duration,
      commissionType: "PERCENT",
      commissionValue,
    },
  });

  revalidateServiceViews();
  return mutationSuccess("Servico atualizado com sucesso.");
}

export async function toggleGlobalServiceAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "");
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return mutationError("Servico nao encontrado.");
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      isActive: !service.isActive,
    },
  });

  revalidateServiceViews();
  return mutationSuccess(service.isActive ? "Servico desativado." : "Servico ativado.");
}

export async function deleteGlobalServiceAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "");
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    return mutationError("Servico nao encontrado.");
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  revalidateServiceViews();
  return mutationSuccess("Servico excluido com sucesso.");
}
