"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import type { FormFeedbackState } from "@/lib/formFeedbackState";
import { sendPasswordResetCodeEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

function generateCode() {
  return randomInt(100000, 1000000).toString();
}

function getExpirationDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

const MAX_RESET_ATTEMPTS = 5;

export async function requestPasswordResetAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      error: "Informe o e-mail da sua conta.",
      success: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return {
      error: "Nao encontramos uma conta com esse e-mail.",
      success: null,
    };
  }

  const code = generateCode();

  try {
    await prisma.passwordResetRequest.upsert({
      where: { email },
      update: {
        code,
        expiresAt: getExpirationDate(),
        attempts: 0,
      },
      create: {
        email,
        code,
        expiresAt: getExpirationDate(),
      },
    });

    await sendPasswordResetCodeEmail({
      to: email,
      name: user.name || "cliente",
      code,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o codigo de recuperacao.",
      success: null,
    };
  }

  redirect(`/forgot-password/reset?email=${encodeURIComponent(email)}&sent=1`);
}

export async function resendPasswordResetCodeAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!email) {
    return {
      error: "Informe o e-mail para reenviar o codigo.",
      success: null,
    };
  }

  const [resetRequest, user] = await Promise.all([
    prisma.passwordResetRequest.findUnique({
      where: { email },
    }),
    prisma.user.findUnique({
      where: { email },
    }),
  ]);

  if (!resetRequest || !user) {
    return {
      error: "Nao encontramos uma solicitacao de recuperacao para esse e-mail.",
      success: null,
    };
  }

  const code = generateCode();

  try {
    await prisma.passwordResetRequest.update({
      where: { email },
      data: {
        code,
        expiresAt: getExpirationDate(),
        attempts: 0,
      },
    });

    await sendPasswordResetCodeEmail({
      to: email,
      name: user.name || "cliente",
      code,
    });
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Nao foi possivel reenviar o codigo.",
      success: null,
    };
  }

  return {
    error: null,
    success: "Enviamos um novo codigo de recuperacao para o seu e-mail.",
  };
}

export async function resetPasswordWithCodeAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const confirmPassword = String(formData.get("confirmPassword") || "").trim();

  if (!email || !code || !password || !confirmPassword) {
    return {
      error: "Preencha e-mail, codigo e nova senha.",
      success: null,
    };
  }

  if (password.length < 6) {
    return {
      error: "A nova senha deve ter pelo menos 6 caracteres.",
      success: null,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "As senhas informadas nao conferem.",
      success: null,
    };
  }

  const resetRequest = await prisma.passwordResetRequest.findUnique({
    where: { email },
  });

  if (!resetRequest) {
    return {
      error: "Nao encontramos uma solicitacao de recuperacao para esse e-mail.",
      success: null,
    };
  }

  if (resetRequest.expiresAt.getTime() < Date.now()) {
    return {
      error: "Esse codigo expirou. Solicite um novo envio.",
      success: null,
    };
  }

  if (resetRequest.attempts >= MAX_RESET_ATTEMPTS) {
    return {
      error: "Muitas tentativas invalidas. Solicite um novo codigo.",
      success: null,
    };
  }

  if (resetRequest.code !== code) {
    await prisma.passwordResetRequest.update({
      where: { email },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    return {
      error: "Codigo invalido. Confira o e-mail e tente novamente.",
      success: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await prisma.passwordResetRequest.delete({
      where: { email },
    });

    return {
      error: "Nao encontramos uma conta ativa com esse e-mail.",
      success: null,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: {
        passwordHash,
      },
    }),
    prisma.passwordResetRequest.delete({
      where: { email },
    }),
  ]);

  redirect("/login?reset=1");
}
