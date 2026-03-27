"use client";

import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stock: number;
};

export function ProductGrid({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return products.reduce((acc, product) => acc + product.price * (cart[product.id] || 0), 0);
  }, [cart, products]);

  function add(id: string) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function remove(id: string) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }

  async function checkout() {
    const items = Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (!items.length) {
      alert("Adicione pelo menos um produto.");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      alert("Preencha seus dados para finalizar.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, customerEmail, customerPhone, items })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(data.message || "Erro ao iniciar pagamento.");
      return;
    }

    window.location.href = data.initPoint;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-52 w-full object-cover" />
            ) : (
              <div className="flex h-52 items-center justify-center bg-zinc-800 text-zinc-400">Sem imagem</div>
            )}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-white">{product.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{product.description}</p>
              <p className="mt-3 text-emerald-400 font-semibold">{formatCurrency(product.price)}</p>
              <p className="mt-1 text-xs text-zinc-500">Estoque: {product.stock}</p>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => remove(product.id)} className="rounded-lg border border-zinc-700 px-3 py-1 text-white">-</button>
                <span className="min-w-8 text-center text-white">{cart[product.id] || 0}</span>
                <button onClick={() => add(product.id)} className="rounded-lg bg-emerald-500 px-3 py-1 font-semibold text-black">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:sticky lg:top-24">
        <h3 className="text-xl font-semibold text-white">Finalizar compra</h3>
        <div className="mt-4 space-y-3">
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Seu nome" className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" />
          <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" placeholder="Seu e-mail" className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" />
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Seu WhatsApp" className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" />
        </div>
        <div className="mt-4 space-y-2 text-sm text-zinc-300">
          {products.filter((product) => (cart[product.id] || 0) > 0).map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <span>{product.name} x {cart[product.id]}</span>
              <span>{formatCurrency(product.price * (cart[product.id] || 0))}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4 text-white">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <button onClick={checkout} disabled={loading} className="mt-4 w-full rounded-xl bg-sky-500 px-4 py-3 font-semibold text-black disabled:opacity-60">
          {loading ? "Redirecionando..." : "Pagar com Mercado Pago"}
        </button>
      </aside>
    </div>
  );
}
