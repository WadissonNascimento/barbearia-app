"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import AddToCartButton from "@/components/AddToCartButton";
import { useCart } from "@/context/CartContext";
import { normalizeProductImageUrl } from "@/lib/productImageUrl";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export function ProductGrid({ products }: { products: Product[] }) {
  const { cartCount } = useCart();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
            Loja
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            Produtos disponiveis
          </h2>
        </div>

        <Link
          href="/carrinho"
          className="rounded-2xl border border-white/10 bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          Ver carrinho ({cartCount})
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-sky-400/30 hover:bg-white/[0.06]"
          >
            <div className="relative h-64 border-b border-white/10 bg-black/10">
              {normalizeProductImageUrl(product.imageUrl) ? (
                <img
                  src={normalizeProductImageUrl(product.imageUrl) || ""}
                  alt={product.name}
                  className="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    {product.description || "Produto sem descricao."}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Estoque {product.stock}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Preco
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {formatCurrency(product.price)}
                </p>
              </div>

              <div className="mt-5">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
