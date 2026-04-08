"use client";

import { useCart } from "@/context/CartContext";
import { createOrder } from "@/app/actions/orderActions";
import { useState } from "react";

export default function CarrinhoPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  async function finalizarPedido() {
    setLoading(true);

    try {
      await createOrder({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      alert("Pedido realizado com sucesso!");
    } catch (error) {
      alert("Erro ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl mb-6">Carrinho</h1>

      {cart.length === 0 && <p>Carrinho vazio</p>}

      {cart.map((item) => (
        <div key={item.productId} className="bg-zinc-900 p-4 mb-2 rounded">
          <p>{item.name}</p>
          <p>R$ {item.price}</p>
          <p>Qtd: {item.quantity}</p>

          <button
            onClick={() => removeFromCart(item.productId)}
            className="bg-red-600 px-2 py-1 mt-2"
          >
            Remover
          </button>
        </div>
      ))}

      <h2 className="mt-4 text-xl">Total: R$ {total}</h2>

      <button
        onClick={finalizarPedido}
        className="mt-4 bg-green-600 px-4 py-2"
      >
        {loading ? "Finalizando..." : "Finalizar Pedido"}
      </button>
    </div>
  );
}