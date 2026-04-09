"use client";

import Link from "next/link";
import { useState } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

type CartFeedback = {
  message: string;
  tone: "error" | "success" | "info";
};

type CheckoutQuote = {
  subtotal: number;
  shippingCost: number;
  shippingMethod: string;
  shippingEta: string;
  discountTotal: number;
  total: number;
  couponCode: string | null;
};

export default function CarrinhoPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [shippingZipCode, setShippingZipCode] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [feedback, setFeedback] = useState<CartFeedback | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  async function calcularResumo() {
    if (!cart.length) {
      setFeedback({
        message: "Seu carrinho esta vazio.",
        tone: "info",
      });
      return;
    }

    if (!shippingZipCode) {
      setFeedback({
        message: "Informe o CEP para calcular o frete.",
        tone: "error",
      });
      return;
    }

    setQuoteLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingZipCode,
          couponCode: couponCode || null,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel calcular o pedido.");
      }

      setQuote(data);
      setFeedback({
        message: "Resumo atualizado com frete e cupom.",
        tone: "success",
      });
    } catch (error) {
      setQuote(null);
      setFeedback({
        message:
          error instanceof Error ? error.message : "Nao foi possivel calcular o pedido.",
        tone: "error",
      });
    } finally {
      setQuoteLoading(false);
    }
  }

  async function finalizarPedido() {
    if (!cart.length) {
      setFeedback({
        message: "Seu carrinho esta vazio.",
        tone: "info",
      });
      return;
    }

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !customerAddress ||
      !shippingZipCode
    ) {
      setFeedback({
        message: "Preencha nome, e-mail, telefone, endereco e CEP para finalizar.",
        tone: "error",
      });
      return;
    }

    setFeedback(null);
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
          customerAddress,
          shippingZipCode,
          couponCode: couponCode || null,
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
      window.location.href =
        data.initPoint ||
        data.redirectTo ||
        `/rastreio?email=${encodeURIComponent(customerEmail)}`;
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error ? error.message : "Erro ao finalizar pedido.",
        tone: "error",
      });
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
            Revise seus itens, calcule frete, aplique cupom e finalize o pedido.
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
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
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

            <div className="mt-4">
              <FeedbackMessage
                message={feedback?.message ?? null}
                tone={feedback?.tone ?? "error"}
              />
            </div>

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
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Endereco para entrega"
                className="min-h-28 w-full rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              />
              <input
                value={shippingZipCode}
                onChange={(e) => setShippingZipCode(e.target.value)}
                placeholder="CEP"
                className="w-full rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              />
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Cupom"
                  className="flex-1 rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
                />
                <button
                  type="button"
                  onClick={calcularResumo}
                  disabled={quoteLoading}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/5 disabled:opacity-60"
                >
                  {quoteLoading ? "Calculando..." : "Calcular"}
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Subtotal</span>
                <strong className="text-white">
                  {formatCurrency(quote?.subtotal ?? cartTotal)}
                </strong>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span>Frete</span>
                <strong className="text-white">
                  {quote ? formatCurrency(quote.shippingCost) : "Calcule"}
                </strong>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span>Desconto</span>
                <strong className="text-emerald-300">
                  {formatCurrency(-(quote?.discountTotal ?? 0))}
                </strong>
              </div>

              {quote && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-zinc-400">
                  <p>{quote.shippingMethod}</p>
                  <p>Prazo estimado: {quote.shippingEta}</p>
                  {quote.couponCode && <p>Cupom aplicado: {quote.couponCode}</p>}
                </div>
              )}

              <div className="flex items-center justify-between text-base text-zinc-200">
                <span>Total</span>
                <strong className="text-white">
                  {formatCurrency(quote?.total ?? cartTotal)}
                </strong>
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
