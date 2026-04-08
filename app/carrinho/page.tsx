"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export default function CarrinhoPage() {
  const {
    cart,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  async function finalizarPedido() {
    if (!cart.length) {
      alert("Seu carrinho esta vazio.");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      alert("Preencha nome, e-mail e telefone para finalizar.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao finalizar pedido.");
      }

      clearCart();
      window.location.href = data.initPoint || data.redirectTo || "/sucesso";
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Carrinho</h1>
          <p className="text-zinc-400">
            Revise seus itens e finalize o pedido.
          </p>
        </div>

        <Link
          href="/produtos"
          className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Continuar comprando
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-zinc-300">Seu carrinho esta vazio.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-sm text-zinc-400">
                      {formatCurrency(item.price)} por unidade
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="h-10 w-10 rounded-xl border border-white/10"
                    >
                      -
                    </button>
                    <span className="min-w-8 text-center text-lg">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="h-10 w-10 rounded-xl border border-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-sm text-red-300 hover:text-red-200"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold">Finalizar compra</h2>

            <div className="mt-4 space-y-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              />
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Seu e-mail"
                type="email"
                className="w-full rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Seu telefone"
                className="w-full rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Total</span>
                <strong className="text-white">{formatCurrency(cartTotal)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={finalizarPedido}
              disabled={loading}
              className="mt-5 w-full rounded-2xl bg-sky-500 px-4 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:opacity-60"
            >
              {loading ? "Finalizando..." : "Finalizar pedido"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
