"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendVerificationCodeEmail } from "@/lib/mail";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  return session.user;
}

function generateVerificationCode() {
  return randomInt(100000, 1000000).toString();
}

function getExpirationDate() {
  return new Date(Date.now() + 10 * 60 * 1000);
}

function buildVerificationUrl(email: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  return `${baseUrl}/register/verify?email=${encodeURIComponent(email)}`;
}

export async function createBarberAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !password) {
    return mutationError("Nome, e-mail e senha sao obrigatorios.");
  }

  if (password.length < 6) {
    return mutationError("A senha deve ter pelo menos 6 caracteres.");
  }

  const [existingUser, existingPendingRegistration] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
    }),
    prisma.pendingRegistration.findUnique({
      where: { email },
    }),
  ]);

  if (existingUser) {
    return mutationError(
      existingUser.isActive
        ? "Ja existe uma conta ativa com esse e-mail."
        : "Ja existe um barbeiro desligado com esse e-mail. Reative a conta existente em vez de criar outra."
    );
  }

  if (existingPendingRegistration) {
    return mutationError(
      "Ja existe um cadastro pendente com esse e-mail. O barbeiro precisa concluir a verificacao antes de um novo convite."
    );
  }

  const code = generateVerificationCode();
  const hashedPassword = await bcrypt.hash(password, 10);
  let pendingCreated = false;

  try {
    await prisma.pendingRegistration.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: hashedPassword,
        role: "BARBER",
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
      accountLabel: "o cadastro de barbeiro",
    });
  } catch (error) {
    if (pendingCreated) {
      await prisma.pendingRegistration.deleteMany({
        where: { email },
      });
    }

    return mutationError(
      error instanceof Error
        ? error.message
        : "Nao foi possivel enviar o convite do barbeiro."
    );
  }

  revalidatePath("/admin/barbeiros");
  return mutationSuccess(
    "Convite enviado. O barbeiro precisa confirmar o e-mail para ativar a conta."
  );
}

export async function toggleBarberStatusAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const barberId = String(formData.get("barberId") || "");
  const currentActive = String(formData.get("currentActive") || "") === "true";

  if (!barberId) {
    return mutationError("Barbeiro invalido.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
    },
    select: {
      id: true,
    },
  });

  if (!barber) {
    return mutationError("Barbeiro nao encontrado.");
  }

  await prisma.user.update({
    where: { id: barberId },
    data: {
      isActive: !currentActive,
    },
  });

  revalidatePath("/admin/barbeiros");
  revalidatePath("/admin/agenda");
  return mutationSuccess(
    currentActive ? "Barbeiro inativado." : "Barbeiro reativado."
  );
}

export async function deleteBarberAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const barberId = String(formData.get("barberId") || "");

  if (!barberId) {
    return mutationError("Barbeiro invalido.");
  }

  const barber = await prisma.user.findFirst({
    where: {
      id: barberId,
      role: "BARBER",
    },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!barber) {
    return mutationError("Barbeiro nao encontrado.");
  }

  if (!barber.isActive) {
    return mutationSuccess("Esse barbeiro ja esta desligado.", undefined, "info");
  }

  await prisma.user.update({
    where: { id: barberId },
    data: {
      isActive: false,
    },
  });

  revalidatePath("/admin/barbeiros");
  revalidatePath("/admin/agenda");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/servicos");
  revalidatePath("/agendar");
  revalidatePath("/meu-perfil");
  return mutationSuccess(
    "Barbeiro desligado com sucesso. Historico, servicos prestados e fechamentos foram preservados."
  );
}
