"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import type { LoginFormState } from "@/lib/loginFormState";

export async function loginAction(
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

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    });

    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha invalidos." };
    }

    throw error;
  }
}
