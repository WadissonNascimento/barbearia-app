"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const orderInclude = {
  customer: true,
  items: {
    include: {
      product: true,
    },
  },
} as const;

export async function createOrder(data: {
  items: {
    productId: string;
    quantity: number;
  }[];
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Usuario nao autenticado.");
  }

  if (data.items.length === 0) {
    throw new Error("O pedido precisa ter pelo menos um item.");
  }

  let total = 0;

  const itemsWithPrice = await Promise.all(
    data.items.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) {
        throw new Error("Produto nao encontrado.");
      }

      if (product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}.`);
      }

      total += product.price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    })
  );

  const order = await prisma.order.create({
    data: {
      customerId: session.user.id,
      total,
      items: {
        create: itemsWithPrice,
      },
    },
    include: orderInclude,
  });

  revalidatePath("/carrinho");
  revalidatePath("/meus-pedidos");
  revalidatePath("/admin/pedidos");

  return order;
}

export async function getOrders() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  return prisma.order.findMany({
    include: orderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getMyOrders(customerId?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Nao autenticado.");
  }

  const targetCustomerId = customerId || session.user.id;

  if (session.user.role !== "ADMIN" && targetCustomerId !== session.user.id) {
    throw new Error("Nao autorizado.");
  }

  return prisma.order.findMany({
    where: {
      customerId: targetCustomerId,
    },
    include: orderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function confirmOrder(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CONFIRMED",
      adminApproved: true,
    },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/meus-pedidos");
}

export async function saveTrackingCode(orderId: string, trackingCode: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  const normalizedCode = trackingCode.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Informe um codigo de rastreio valido.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      trackingCode: normalizedCode,
      status: "SHIPPED",
    },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/meus-pedidos");
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/meus-pedidos");
}

export async function deleteOrder(orderId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }

  await prisma.order.delete({
    where: { id: orderId },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/meus-pedidos");
}
