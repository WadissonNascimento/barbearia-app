"use client";

import { useCart } from "@/context/CartContext";

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();

  function handleAdd() {
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    });
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full rounded-xl bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-500"
    >
      Adicionar ao carrinho
    </button>
  );
}