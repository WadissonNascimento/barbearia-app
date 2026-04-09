import type { Coupon, Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateCouponDiscount } from "@/lib/orderPricing";
import { calculateShipping } from "@/lib/shipping";

export type CheckoutItemInput = {
  productId: string;
  quantity: number;
};

export async function getCheckoutProducts(items: CheckoutItemInput[]) {
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId),
      },
    },
  });

  const missing = items.find(
    (item) => !products.find((product) => product.id === item.productId)
  );

  if (missing) {
    throw new Error("Produto invalido no carrinho.");
  }

  const unavailable = items.find((item) => {
    const product = products.find((entry) => entry.id === item.productId)!;
    return !product.isActive || product.stock < item.quantity;
  });

  if (unavailable) {
    throw new Error("Um ou mais produtos estao indisponiveis.");
  }

  return products;
}

export async function findCouponByCode(code?: string | null) {
  const normalized = String(code || "").trim().toUpperCase();

  if (!normalized) {
    return null;
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalized },
  });

  if (!coupon) {
    throw new Error("Cupom nao encontrado.");
  }

  return coupon;
}

export function calculateOrderSubtotal(
  items: CheckoutItemInput[],
  products: Product[]
) {
  return Number(
    items
      .reduce((sum, item) => {
        const product = products.find((entry) => entry.id === item.productId)!;
        return sum + product.price * item.quantity;
      }, 0)
      .toFixed(2)
  );
}

export function buildCheckoutSummary(input: {
  items: CheckoutItemInput[];
  products: Product[];
  zipCode: string;
  coupon: Coupon | null;
}) {
  const subtotal = calculateOrderSubtotal(input.items, input.products);
  const shipping = calculateShipping(input.zipCode, subtotal);
  const discountTotal = input.coupon
    ? calculateCouponDiscount(input.coupon, subtotal)
    : 0;
  const total = Number((subtotal + shipping.cost - discountTotal).toFixed(2));

  return {
    subtotal,
    shipping,
    discountTotal,
    total,
    coupon: input.coupon,
  };
}
