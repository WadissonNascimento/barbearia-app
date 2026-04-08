"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    throw new Error("Nao autorizado.");
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name) {
    throw new Error("Informe seu nome.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      phone: phone || null,
    },
  });

  revalidatePath("/meu-perfil");
  revalidatePath("/customer");
}
