"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const produtos = [
  {
    id: 1,
    nome: "Pomada Modeladora Premium",
    precoAntigo: 49.9,
    precoAtual: 39.9,
    promocao: true,
    descontoTexto: "20% OFF",
    frete: "Frete grátis",
    imagem: "/produtos/pomada.png",
  },
  {
    id: 2,
    nome: "Óleo para Barba",
    precoAntigo: 39.9,
    precoAtual: 34.9,
    promocao: true,
    descontoTexto: "12% OFF",
    frete: "Frete grátis",
    imagem: "/produtos/oleo-barba.png",
  },
  {
    id: 3,
    nome: "Shampoo Premium",
    precoAntigo: 44.9,
    precoAtual: 44.9,
    promocao: false,
    descontoTexto: "",
    frete: "Frete grátis",
    imagem: "/produtos/shampoo.png",
  },
  {
    id: 4,
    nome: "Balm Pós-Barba",
    precoAntigo: 34.9,
    precoAtual: 29.9,
    promocao: true,
    descontoTexto: "14% OFF",
    frete: "Frete grátis",
    imagem: "/produtos/balm.png",
  },
  {
    id: 5,
    nome: "Pomada Efeito Seco",
    precoAntigo: 42.9,
    precoAtual: 42.9,
    promocao: false,
    descontoTexto: "",
    frete: "Frete grátis",
    imagem: "/produtos/pomada.png",
  },
  {
    id: 6,
    nome: "Kit Barba Completo",
    precoAntigo: 89.9,
    precoAtual: 74.9,
    promocao: true,
    descontoTexto: "17% OFF",
    frete: "Frete grátis",
    imagem: "/produtos/oleo-barba.png",
  },
];

function formatarPreco(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

export default function ProdutosPage() {
  const produtosPromocao = useMemo(
    () => produtos.filter((produto) => produto.promocao),
    []
  );

  const [currentPromo, setCurrentPromo] = useState(0);

  function nextPromo() {
    setCurrentPromo((prev) => (prev + 1) % produtosPromocao.length);
  }

  function prevPromo() {
    setCurrentPromo(
      (prev) => (prev - 1 + produtosPromocao.length) % produtosPromocao.length
    );
  }

  const promoAtual = produtosPromocao[currentPromo];

  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-8">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            Produtos
          </span>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Vitrine digital
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Veja os produtos disponíveis e destaque promoções em um carrossel
            separado, no estilo loja.
          </p>
        </div>

        {/* CARROSSEL SÓ DE PROMOÇÃO */}
        <div className="relative mb-8">
          <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                  Promoções
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Produtos em destaque
                </h2>
              </div>

              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300">
                {String(currentPromo + 1).padStart(2, "0")} /{" "}
                {String(produtosPromocao.length).padStart(2, "0")}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20">
                <div className="absolute left-4 top-4 z-20 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  {promoAtual.descontoTexto}
                </div>

                <div className="relative h-[280px] w-full sm:h-[380px]">
                  <Image
                    src={promoAtual.imagem}
                    alt={promoAtual.nome}
                    fill
                    priority
                    className="object-contain p-6"
                  />
                </div>

                <button
                  type="button"
                  onClick={prevPromo}
                  className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-sky-500/20"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={nextPromo}
                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-sky-500/20"
                >
                  ›
                </button>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                  Oferta da vez
                </p>

                <h3 className="mt-3 text-3xl font-bold text-white">
                  {promoAtual.nome}
                </h3>

                <div className="mt-5">
                  <p className="text-sm text-zinc-500 line-through">
                    {formatarPreco(promoAtual.precoAntigo)}
                  </p>
                  <p className="mt-1 text-4xl font-bold text-white">
                    {formatarPreco(promoAtual.precoAtual)}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-sm text-emerald-400">
                  <p>{promoAtual.descontoTexto} no Pix ou saldo</p>
                  <p>{promoAtual.frete}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400 active:scale-[0.98]"
                  >
                    Comprar agora
                  </button>

                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-medium text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2">
              {produtosPromocao.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPromo(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentPromo === index
                      ? "w-6 bg-sky-400"
                      : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* GRADE DOS PRODUTOS */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Todos os produtos
          </h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((produto) => (
              <button
                key={produto.id}
                type="button"
                className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] text-left shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition hover:border-sky-400/30 hover:bg-white/[0.06]"
              >
                <div className="relative h-[180px] w-full border-b border-white/10 bg-black/10">
                  {produto.promocao && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">
                      {produto.descontoTexto}
                    </div>
                  )}

                  <Image
                    src={produto.imagem}
                    alt={produto.nome}
                    fill
                    className="object-contain p-4 transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-4">
                  <p className="line-clamp-2 min-h-[48px] text-sm font-medium text-white">
                    {produto.nome}
                  </p>

                  <div className="mt-3">
                    {produto.precoAntigo > produto.precoAtual && (
                      <p className="text-xs text-zinc-500 line-through">
                        {formatarPreco(produto.precoAntigo)}
                      </p>
                    )}

                    <p className="text-2xl font-bold text-white">
                      {formatarPreco(produto.precoAtual)}
                    </p>
                  </div>

                  <div className="mt-2 space-y-1">
                    {produto.promocao && (
                      <p className="text-xs font-medium text-emerald-400">
                        {produto.descontoTexto} no Pix
                      </p>
                    )}

                    <p className="text-xs font-medium text-emerald-400">
                      {produto.frete}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}