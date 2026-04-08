"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createBarberAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !password) {
    throw new Error("Nome, e-mail e senha sao obrigatorios.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Ja existe um usuario com esse e-mail.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      phone: phone || null,
      role: "BARBER",
      isActive: true,
    },
  });

  revalidatePath("/admin/barbeiros");
  revalidatePath("/admin/agenda");
}

export async function toggleBarberStatusAction(formData: FormData) {
  const barberId = String(formData.get("barberId") || "");
  const currentActive = String(formData.get("currentActive") || "") === "true";

  if (!barberId) {
    throw new Error("Barbeiro invalido.");
  }

  await prisma.user.update({
    where: { id: barberId },
    data: {
      isActive: !currentActive,
    },
  });

  revalidatePath("/admin/barbeiros");
  revalidatePath("/admin/agenda");
}

export async function deleteBarberAction(formData: FormData) {
  const barberId = String(formData.get("barberId") || "");

  if (!barberId) {
    throw new Error("Barbeiro invalido.");
  }

  await prisma.appointment.deleteMany({
    where: {
      barberId,
    },
  });

  await prisma.user.delete({
    where: { id: barberId },
  });

  revalidatePath("/admin/barbeiros");
  revalidatePath("/admin/agenda");
}
