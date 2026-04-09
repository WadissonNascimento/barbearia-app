import { registerStockMovement } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";

export async function reserveInventoryForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.adminApproved) {
    return;
  }

  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });

    await registerStockMovement({
      productId: item.productId,
      type: "OUT",
      quantity: item.quantity,
      reason: `Baixa automatica do pedido ${order.id.slice(-6).toUpperCase()}`,
    });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      adminApproved: true,
    },
  });
}
