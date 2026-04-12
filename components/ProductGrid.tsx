"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles } from "lucide-react";
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
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
        >
          <ShoppingCart aria-hidden="true" className="h-4 w-4" />
          <span>Ver carrinho ({cartCount})</span>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:border-sky-400/30 hover:bg-white/[0.06]"
          >
            <div className="relative h-64 border-b border-white/10 bg-black/10">
              <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                {index === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-300/30 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                    Mais vendido
                  </span>
                ) : null}
                {product.stock <= 3 ? (
                  <span className="rounded-full border border-amber-300/30 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-100">
                    Ultimas unidades
                  </span>
                ) : null}
              </div>
              {normalizeProductImageUrl(product.imageUrl) ? (
                <Image
                  src={normalizeProductImageUrl(product.imageUrl) || ""}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-contain p-6 transition duration-300 group-hover:scale-105"
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
                <span className="rounded-full border border-[var(--brand)]/30 bg-[var(--brand-muted)] px-3 py-1 text-xs font-medium text-[var(--brand-strong)]">
                  {product.stock} em estoque
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
