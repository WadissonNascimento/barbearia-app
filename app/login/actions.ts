"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          throw new Error("Email ou senha inválidos.");
        default:
          throw new Error("Não foi possível entrar.");
      }
    }

    throw error;
  }
}