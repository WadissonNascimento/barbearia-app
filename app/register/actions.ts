"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  isUsingDevelopmentMailFallback,
  sendVerificationCodeEmail,
} from "@/lib/mail";
import type { FormFeedbackState } from "@/lib/formFeedbackState";

function generateVerificationCode() {
  return randomInt(100000, 1000000).toString();
}

function getExpirationDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

const MAX_CODE_ATTEMPTS = 5;
const PASSWORD_REQUIREMENT_MESSAGE =
  "A senha deve ter no minimo 7 caracteres, pelo menos 1 letra e 1 caractere especial.";

function isValidRegistrationPassword(password: string) {
  return (
    password.length >= 7 &&
    /[A-Za-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function buildPendingRegistrationRedirect(email: string, code?: string) {
  const devCodeQuery =
    code && isUsingDevelopmentMailFallback()
      ? `&devCode=${encodeURIComponent(code)}`
      : "";

  return `/register/verify?email=${encodeURIComponent(email)}&sent=1${devCodeQuery}`;
}

function buildVerificationUrl(email: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  return `${baseUrl}/register/verify?email=${encodeURIComponent(email)}`;
}

export async function registerCustomerAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !phone || !password) {
    return {
      error: "Nome, e-mail, telefone e senha sao obrigatorios.",
      success: null,
    };
  }

  if (!isValidRegistrationPassword(password)) {
    return {
      error: PASSWORD_REQUIREMENT_MESSAGE,
      success: null,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "Ja existe uma conta com esse e-mail.",
      success: null,
    };
  }

  const existingPendingRegistration = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  if (existingPendingRegistration) {
    if (existingPendingRegistration.expiresAt.getTime() < Date.now()) {
      await prisma.pendingRegistration.delete({
        where: { email },
      });
    } else {
      redirect(
        buildPendingRegistrationRedirect(email, existingPendingRegistration.code)
      );
    }
  }

  const code = generateVerificationCode();
  const hashedPassword = await bcrypt.hash(password, 10);
  let pendingCreated = false;

  try {
    await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: "CUSTOMER",
        code,
        expiresAt: getExpirationDate(),
        attempts: 0,
      },
    });
    pendingCreated = true;

    await sendVerificationCodeEmail({
      to: email,
      name,
      code,
      verifyUrl: buildVerificationUrl(email),
      accountLabel: "seu cadastro",
    });
  } catch (error) {
    if (pendingCreated) {
      await prisma.pendingRegistration.deleteMany({
        where: { email },
      });
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o codigo de verificacao.",
      success: null,
    };
  }

  redirect(buildPendingRegistrationRedirect(email, code));
}

export async function verifyRegistrationCodeAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") || "").trim();

  if (!email || !code) {
    return {
      error: "Informe o e-mail e o codigo de verificacao.",
      success: null,
    };
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  if (!pending) {
    return {
      error: "Nao encontramos um cadastro pendente para esse e-mail.",
      success: null,
    };
  }

  if (pending.expiresAt.getTime() < Date.now()) {
    return {
      error: "Esse codigo expirou. Solicite um novo envio.",
      success: null,
    };
  }

  if (pending.attempts >= MAX_CODE_ATTEMPTS) {
    return {
      error: "Muitas tentativas invalidas. Solicite um novo codigo.",
      success: null,
    };
  }

  if (pending.code !== code) {
    await prisma.pendingRegistration.update({
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

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.pendingRegistration.delete({
      where: { email },
    });

    return {
      error: "Ja existe uma conta ativa com esse e-mail.",
      success: null,
    };
  }

  await prisma.$transaction([
    prisma.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        phone: pending.phone,
        role: pending.role,
        isActive: true,
        emailVerified: new Date(),
      },
    }),
    prisma.pendingRegistration.delete({
      where: { email },
    }),
  ]);

  redirect("/login?registered=1");
}

export async function resendRegistrationCodeAction(
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

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email },
  });

  if (!pending) {
    return {
      error: "Nao encontramos um cadastro pendente para esse e-mail.",
      success: null,
    };
  }

  if (pending.expiresAt.getTime() < Date.now()) {
    return {
      error: "O codigo anterior expirou. Recomece o cadastro para receber um novo.",
      success: null,
    };
  }

  const code = generateVerificationCode();
  const previousCode = pending.code;
  const previousExpiresAt = pending.expiresAt;
  const previousAttempts = pending.attempts;

  try {
    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        code,
        expiresAt: getExpirationDate(),
        attempts: 0,
      },
    });

    await sendVerificationCodeEmail({
      to: email,
      name: pending.name,
      code,
      verifyUrl: buildVerificationUrl(email),
      accountLabel: "seu cadastro",
    });
  } catch (error) {
    await prisma.pendingRegistration.update({
      where: { email },
      data: {
        code: previousCode,
        expiresAt: previousExpiresAt,
        attempts: previousAttempts,
      },
    });

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
    success: isUsingDevelopmentMailFallback()
      ? `Codigo de verificacao local: ${code}`
      : "Enviamos um novo codigo para o seu e-mail.",
  };
}
