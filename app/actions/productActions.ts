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

  const name = data.name.trim();
  const price = Number(data.price);
  const stock = Number(data.stock);

  if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
    throw new Error("Preencha nome, preco e estoque corretamente.");
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: data.description?.trim() || null,
      price,
      imageUrl: normalizeProductImageUrl(data.imageUrl?.trim() || null),
      stock,
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

export async function createProductFromForm(formData: FormData) {
  await ensureProductAccess();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price") || 0);
  const stock = Number(formData.get("stock") || 0);
  const imageFile = formData.get("image");

  if (
    !name ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
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

  if (
    (typeof data.name === "string" && !data.name.trim()) ||
    (typeof data.price === "number" && (!Number.isFinite(data.price) || data.price <= 0)) ||
    (typeof data.stock === "number" &&
      (!Number.isInteger(data.stock) || data.stock < 0))
  ) {
    throw new Error("Dados de produto invalidos.");
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      name: data.name?.trim(),
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

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      isActive: true,
      _count: {
        select: {
          orderItems: true,
          stockMovements: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Produto nao encontrado.");
  }

  if (product._count.orderItems > 0 || product._count.stockMovements > 0) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    revalidateProductViews();
    return {
      deleted: false,
      message: product.isActive
        ? "Produto ocultado para preservar historico de pedidos e estoque."
        : "Produto ja estava oculto. Historico preservado.",
    };
  }

  await prisma.product.delete({
    where: { id },
  });

  revalidateProductViews();
  return {
    deleted: true,
    message: "Produto excluido com sucesso.",
  };
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
