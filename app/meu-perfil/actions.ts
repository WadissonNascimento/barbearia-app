"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";
import { prisma } from "@/lib/prisma";

export async function updateCustomerProfileAction(
  formData: FormData
): Promise<MutationResult> {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    throw new Error("Nao autorizado.");
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const preferredBarberId = String(formData.get("preferredBarberId") || "").trim();
  const allergies = String(formData.get("allergies") || "").trim();
  const preferences = String(formData.get("preferences") || "").trim();

  if (!name) {
    return mutationError("Informe seu nome.");
  }

  if (preferredBarberId) {
    const preferredBarber = await prisma.user.findFirst({
      where: {
        id: preferredBarberId,
        role: "BARBER",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!preferredBarber) {
      return mutationError(
        "O barbeiro preferido selecionado nao esta disponivel."
      );
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
      },
    }),
    prisma.customerProfile.upsert({
      where: {
        customerId: session.user.id,
      },
      update: {
        preferredBarberId: preferredBarberId || null,
        allergies: allergies || null,
        preferences: preferences || null,
      },
      create: {
        customerId: session.user.id,
        preferredBarberId: preferredBarberId || null,
        allergies: allergies || null,
        preferences: preferences || null,
      },
    }),
  ]);

  revalidatePath("/meu-perfil");
  revalidatePath("/customer");
  return mutationSuccess("Perfil atualizado com sucesso.");
}
