"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "").trim();

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "E-mail ou senha inválidos.",
      };
    }

    throw error;
  }
}