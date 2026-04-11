"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
};

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl || null,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-medium text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)] transition hover:brightness-110"
    >
      {added ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}
