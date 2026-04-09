"use server";

import { auth } from "@/auth";
import { registerStockMovement } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { normalizeProductImageUrl, saveProductImage } from "@/lib/productImages";

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
  revalidatePath("/admin/produtos/novo");
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
      imageUrl: normalizeProductImageUrl(data.imageUrl?.trim() || null),
      stock: Number(data.stock),
    },
  });

  await registerStockMovement({
    productId: product.id,
    type: "IN",
    quantity: Number(data.stock),
    reason: "Cadastro inicial do produto",
  });

  revalidateProductViews();
  return product;
}

export async function createProductFromForm(formData: FormData) {
  await ensureProductAccess();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const stock = Number(formData.get("stock") || 0);
  const imageFile = formData.get("image");

  if (!name || !price || stock < 0) {
    throw new Error("Preencha nome, preco e estoque corretamente.");
  }

  const imageUrl =
    imageFile instanceof File ? await saveProductImage(imageFile) : null;

  const product = await prisma.product.create({
    data: {
      name,
      description: description || null,
      price,
      stock,
      imageUrl,
    },
  });

  await registerStockMovement({
    productId: product.id,
    type: "IN",
    quantity: stock,
    reason: "Cadastro inicial do produto",
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

  const currentProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!currentProduct) {
    throw new Error("Produto nao encontrado.");
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      imageUrl:
        data.imageUrl === undefined
          ? undefined
          : normalizeProductImageUrl(data.imageUrl),
    },
  });

  if (typeof data.stock === "number" && data.stock !== currentProduct.stock) {
    const difference = data.stock - currentProduct.stock;

    await registerStockMovement({
      productId: id,
      type: difference > 0 ? "ADJUST_IN" : "ADJUST_OUT",
      quantity: Math.abs(difference),
      reason: "Ajuste manual de estoque",
    });
  }

  revalidateProductViews();
  return product;
}

export async function updateProductImage(formData: FormData) {
  await ensureProductAccess();

  const productId = String(formData.get("productId") || "");
  const imageFile = formData.get("image");

  if (!productId || !(imageFile instanceof File) || imageFile.size === 0) {
    throw new Error("Selecione uma imagem para enviar.");
  }

  const imageUrl = await saveProductImage(imageFile);

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });

  revalidateProductViews();
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
