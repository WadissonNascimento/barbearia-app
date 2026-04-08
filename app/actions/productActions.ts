"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function ensureProductAccess() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nao autorizado.");
  }
}

function revalidateProductViews() {
  revalidatePath("/produtos");
  revalidatePath("/loja");
  revalidatePath("/carrinho");
  revalidatePath("/admin");
  revalidatePath("/admin/produtos");
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
}) {
  await ensureProductAccess();

  const product = await prisma.product.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: Number(data.price),
      imageUrl: data.imageUrl?.trim() || null,
      stock: Number(data.stock),
    },
  });

  revalidateProductViews();
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    isActive: boolean;
  }>
) {
  await ensureProductAccess();

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  revalidateProductViews();
  return product;
}

export async function deleteProduct(id: string) {
  await ensureProductAccess();

  await prisma.product.delete({
    where: { id },
  });

  revalidateProductViews();
}

export async function toggleProduct(id: string) {
  await ensureProductAccess();

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new Error("Produto nao encontrado.");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      isActive: !product.isActive,
    },
  });

  revalidateProductViews();
  return updatedProduct;
}
