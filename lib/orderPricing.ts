import type { Coupon } from "@prisma/client";

export type CouponApplicationResult = {
  couponId: string | null;
  couponCode: string | null;
  discountTotal: number;
  message: string | null;
};

export function calculateCouponDiscount(coupon: Coupon, subtotal: number) {
  if (subtotal < coupon.minOrderTotal) {
    throw new Error(
      `O cupom exige pedido minimo de ${subtotalToCurrency(coupon.minOrderTotal)}.`
    );
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new Error("Este cupom expirou.");
  }

  if (!coupon.isActive) {
    throw new Error("Este cupom nao esta ativo.");
  }

  if (coupon.usageLimit && coupon.timesUsed >= coupon.usageLimit) {
    throw new Error("Este cupom atingiu o limite de uso.");
  }

  let discount =
    coupon.discountType === "PERCENT"
      ? subtotal * (coupon.discountValue / 100)
      : coupon.discountValue;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  discount = Math.max(0, Math.min(discount, subtotal));

  return Number(discount.toFixed(2));
}

export function subtotalToCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
