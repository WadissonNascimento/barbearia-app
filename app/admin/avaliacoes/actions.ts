"use server";

import { auth } from "@/auth";
import {
  mutationError,
  mutationSuccess,
  type MutationResult,
} from "@/lib/mutationResult";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }
}

function revalidateReviewViews() {
  revalidatePath("/");
  revalidatePath("/avaliacoes");
  revalidatePath("/admin");
  revalidatePath("/admin/avaliacoes");
}

export async function toggleReviewVisibilityAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const reviewId = String(formData.get("reviewId") || "").trim();

  if (!reviewId) {
    return mutationError("Avaliacao invalida.");
  }

  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      isVisible: true,
    },
  });

  if (!review) {
    return mutationError("Avaliacao nao encontrada.");
  }

  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      isVisible: !review.isVisible,
    },
  });

  revalidateReviewViews();
  return mutationSuccess(
    review.isVisible ? "Avaliacao ocultada da home." : "Avaliacao publicada novamente."
  );
}

export async function deleteReviewAction(
  formData: FormData
): Promise<MutationResult> {
  await requireAdmin();

  const reviewId = String(formData.get("reviewId") || "").trim();

  if (!reviewId) {
    return mutationError("Avaliacao invalida.");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  revalidateReviewViews();
  return mutationSuccess("Avaliacao excluida com sucesso.");
}
