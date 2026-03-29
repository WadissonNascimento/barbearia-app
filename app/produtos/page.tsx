import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";

export default async function ProdutosPage() {
  const produtos = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Produtos</h1>
      <ProductGrid products={produtos} />
    </div>
  );
}