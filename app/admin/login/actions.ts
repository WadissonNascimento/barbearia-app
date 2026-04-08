"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { LoginFormState } from "@/lib/loginFormState";

export async function adminLoginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return { error: "Administrador nao encontrado." };
  }

  if (!user.isActive) {
    return { error: "Este usuario esta inativo." };
  }

  if (user.role !== "ADMIN") {
    return { error: "Este acesso e exclusivo para administradores." };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return { error: "Senha invalida." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });

    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Nao foi possivel entrar no painel admin." };
    }

    throw error;
  }
}
