"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function registerCustomerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !password) {
    return {
      error: "Nome, e-mail e senha sao obrigatorios.",
    };
  }

  if (password.length < 6) {
    return {
      error: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "Ja existe uma conta com esse e-mail.",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      phone: phone || null,
      role: "CUSTOMER",
      isActive: true,
    },
  });

  redirect("/login");
}
