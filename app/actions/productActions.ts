"use server";

import { prisma } from "@/lib/prisma";

// CRIAR PRODUTO
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
}) {
  return await prisma.product.create({
    data,
  });
}

// EDITAR PRODUTO
export async function updateProduct(id: string, data: any) {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

// EXCLUIR PRODUTO
export async function deleteProduct(id: string) {
  return await prisma.product.delete({
    where: { id },
  });
}

// TIRAR DE CARTAZ
export async function toggleProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });

  return await prisma.product.update({
    where: { id },
    data: {
      isActive: !product?.isActive,
    },
  });
}