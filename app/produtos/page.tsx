"use client";

import Image from "next/image";
import { useState } from "react";

const produtos = [
  {
    id: 1,
    nome: "Pomada Modeladora",
    preco: 39.9,
    imagem: "/produtos/pomada.png",
    descricao: "Fixação firme com efeito natural para finalizar o corte.",
  },
  {
    id: 2,
    nome: "Óleo para Barba",
    preco: 34.9,
    imagem: "/produtos/oleo-barba.png",
    descricao: "Hidrata, perfuma e deixa a barba alinhada por mais tempo.",
  },
  {
    id: 3,
    nome: "Shampoo Premium",
    preco: 44.9,
    imagem: "/produtos/shampoo.png",
    descricao: "Limpeza profunda sem ressecar, ideal para uso diário.",
  },
  {
    id: 4,
    nome: "Balm Pós-Barba",
    preco: 29.9,
    imagem: "/produtos/balm.png",
    descricao: "Acalma a pele e reduz irritações após o barbear.",
  },
];

export default function ProdutosPage() {
  const [current, setCurrent] = useState(0);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const produtoAtual = produtos[current];

  function nextProduct() {
    setCurrent((prev) => (prev + 1) % produtos.length);
  }

  function prevProduct() {
    setCurrent((prev) => (prev - 1 + produtos.length) % produtos.length);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    setTouchEndX(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStartX === null || touchEndX === null) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextProduct();
    } else if (distance < -minSwipeDistance) {
      prevProduct();
    }
  }

  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            Loja
          </span>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Produtos</h1>

          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Conheça os produtos disponíveis na barbearia e escolha o ideal para
            manter seu estilo no dia a dia.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5">
              <div
                className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/20 select-none"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300 backdrop-blur-xl sm:left-4 sm:top-4 sm:px-4 sm:text-xs sm:tracking-[0.25em]">
                  Vitrine digital
                </div>

                <div className="absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-xl sm:right-4 sm:top-4 sm:px-4 sm:text-sm">
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(produtos.length).padStart(2, "0")}
                </div>

                <div className="relative h-[320px] w-full sm:h-[420px] lg:h-[520px]">
                  {produtos.map((produto, index) => (
                    <Image
                      key={produto.id}
                      src={produto.imagem}
                      alt={produto.nome}
                      fill
                      priority={index === 0}
                      className={`object-cover transition-all duration-700 ease-out ${
                        current === index
                          ? "scale-100 opacity-100"
                          : "scale-[1.03] opacity-0"
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

                <button
                  type="button"
                  onClick={prevProduct}
                  className="absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-xl text-white backdrop-blur-xl transition hover:bg-sky-500/20 active:scale-95 sm:left-4 sm:h-12 sm:w-12"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={nextProduct}
                  className="absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-xl text-white backdrop-blur-xl transition hover:bg-sky-500/20 active:scale-95 sm:right-4 sm:h-12 sm:w-12"
                >
                  ›
                </button>

                <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-24">
                  {produtos.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrent(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        current === index ? "w-6 bg-sky-400" : "w-2 bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-5">
                  <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-3 backdrop-blur-xl sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-white sm:text-2xl">
                          {produtoAtual.nome}
                        </h2>

                        <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">
                          {produtoAtual.descricao}
                        </p>
                      </div>

                      <div className="w-fit rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-2 text-base font-bold text-sky-300 sm:px-4 sm:text-lg">
                        R$ {produtoAtual.preco.toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] text-zinc-400 sm:text-sm">
                No celular, arraste para os lados para ver mais produtos.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {produtos.map((produto, index) => (
                  <button
                    key={produto.id}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className={`rounded-2xl border p-3 text-left transition active:scale-[0.98] ${
                      current === index
                        ? "border-sky-400/40 bg-sky-500/10"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-white">
                      {produto.nome}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      R$ {produto.preco.toFixed(2).replace(".", ",")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                Checkout
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                Finalizar compra
              </h3>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
              />

              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
              />

              <input
                type="text"
                placeholder="Seu WhatsApp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Produto</span>
                <span>{produtoAtual.nome}</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
                <span>Total</span>
                <span className="text-xl font-bold text-white">
                  R$ {produtoAtual.preco.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition hover:bg-sky-400 active:scale-[0.98]"
            >
              Pagar com Mercado Pago
            </button>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">
                Escolha um produto na vitrine para visualizar detalhes e seguir
                para a compra.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}