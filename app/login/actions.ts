"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import type { FormFeedbackState } from "@/lib/formFeedbackState";

export async function loginAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (!email || !password) {
    return { error: "Preencha e-mail e senha.", success: null };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/painel",
    });

    return { error: null, success: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha invalidos.", success: null };
    }

    throw error;
  }
}
