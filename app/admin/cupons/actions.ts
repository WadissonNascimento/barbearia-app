"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }
}

function revalidateCoupons() {
  revalidatePath("/admin");
  revalidatePath("/admin/cupons");
  revalidatePath("/carrinho");
}

export async function createCouponAction(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim();
  const discountType = String(formData.get("discountType") || "PERCENT");
  const discountValue = Number(formData.get("discountValue") || 0);
  const minOrderTotal = Number(formData.get("minOrderTotal") || 0);
  const maxDiscountRaw = String(formData.get("maxDiscount") || "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") || "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();

  if (!code || discountValue <= 0) {
    throw new Error("Preencha codigo e valor do desconto corretamente.");
  }

  await prisma.coupon.create({
    data: {
      code,
      description: description || null,
      discountType,
      discountValue,
      minOrderTotal,
      maxDiscount: maxDiscountRaw ? Number(maxDiscountRaw) : null,
      usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
      expiresAt: expiresAtRaw ? new Date(`${expiresAtRaw}T23:59:59`) : null,
    },
  });

  revalidateCoupons();
}

export async function updateCouponAction(formData: FormData) {
  await requireAdmin();

  const couponId = String(formData.get("couponId") || "");
  const description = String(formData.get("description") || "").trim();
  const discountType = String(formData.get("discountType") || "PERCENT");
  const discountValue = Number(formData.get("discountValue") || 0);
  const minOrderTotal = Number(formData.get("minOrderTotal") || 0);
  const maxDiscountRaw = String(formData.get("maxDiscount") || "").trim();
  const usageLimitRaw = String(formData.get("usageLimit") || "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") || "").trim();

  if (!couponId || discountValue <= 0) {
    throw new Error("Dados do cupom invalidos.");
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      description: description || null,
      discountType,
      discountValue,
      minOrderTotal,
      maxDiscount: maxDiscountRaw ? Number(maxDiscountRaw) : null,
      usageLimit: usageLimitRaw ? Number(usageLimitRaw) : null,
      expiresAt: expiresAtRaw ? new Date(`${expiresAtRaw}T23:59:59`) : null,
    },
  });

  revalidateCoupons();
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();

  const couponId = String(formData.get("couponId") || "");
  const coupon = await prisma.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error("Cupom nao encontrado.");
  }

  await prisma.coupon.update({
    where: { id: couponId },
    data: {
      isActive: !coupon.isActive,
    },
  });

  revalidateCoupons();
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();

  const couponId = String(formData.get("couponId") || "");

  if (!couponId) {
    throw new Error("Cupom invalido.");
  }

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  revalidateCoupons();
}
