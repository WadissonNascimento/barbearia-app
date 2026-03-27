import { ProductGrid } from "@/components/ProductGrid";
import { prisma } from "@/lib/prisma";

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold text-white">Produtos</h1>
      <p className="mt-3 text-zinc-300">Venda produtos da barbearia com checkout do Mercado Pago.</p>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
