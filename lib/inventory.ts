import { prisma } from "@/lib/prisma";

export async function registerStockMovement(input: {
  productId: string;
  type: string;
  quantity: number;
  reason?: string | null;
}) {
  if (input.quantity <= 0) {
    return null;
  }

  return prisma.stockMovement.create({
    data: {
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      reason: input.reason || null,
    },
  });
}
