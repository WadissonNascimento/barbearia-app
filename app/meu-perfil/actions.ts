"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildFeedbackRedirect } from "@/lib/pageFeedback";
import { prisma } from "@/lib/prisma";

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await auth();

  const redirectTo = String(formData.get("redirectTo") || "/meu-perfil");

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    throw new Error("Nao autorizado.");
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const birthDateValue = String(formData.get("birthDate") || "").trim();
  const preferredBarberId = String(formData.get("preferredBarberId") || "").trim();
  const allergies = String(formData.get("allergies") || "").trim();
  const preferences = String(formData.get("preferences") || "").trim();

  if (!name) {
    redirect(buildFeedbackRedirect(redirectTo, "Informe seu nome.", "error"));
  }

  const birthDate = birthDateValue ? new Date(`${birthDateValue}T00:00:00`) : null;

  if (birthDate && Number.isNaN(birthDate.getTime())) {
    redirect(buildFeedbackRedirect(redirectTo, "Data de nascimento invalida.", "error"));
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
        birthDate,
        preferredBarberId: preferredBarberId || null,
        allergies: allergies || null,
        preferences: preferences || null,
      },
      create: {
        customerId: session.user.id,
        birthDate,
        preferredBarberId: preferredBarberId || null,
        allergies: allergies || null,
        preferences: preferences || null,
      },
    }),
  ]);

  revalidatePath("/meu-perfil");
  revalidatePath("/customer");
  redirect(buildFeedbackRedirect(redirectTo, "Perfil atualizado com sucesso."));
}
