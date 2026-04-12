import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata = {
  title: "Produtos",
  description: "Produtos selecionados da Jak Barber para cabelo e barba.",
};

export default async function ProdutosPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: {
        gt: 0,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-8">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            Produtos
          </span>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Loja da barbearia
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Escolha seus produtos, adicione ao carrinho e finalize o pedido em um fluxo unico.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-zinc-300">
            Nenhum produto disponivel no momento.
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </main>
  );
}
