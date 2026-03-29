"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const corteImages = [
  "/cortes/corte1.png",
  "/cortes/corte2.png",
  "/cortes/corte3.png",
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % corteImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % corteImages.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + corteImages.length) % corteImages.length);
  }

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Seu estilo começa aqui.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
              Agende seu horário com praticidade, compre produtos e tenha uma
              experiência premium na Jak Barber Company.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/agendar"
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.25)] transition hover:-translate-y-0.5 hover:bg-sky-400"
              >
                Agendar horário
              </Link>

              <Link
                href="/produtos"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ver produtos
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Entrar
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300">
                  Local
                </p>
                <p className="mt-2 text-sm text-zinc-100">Osasco, SP</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300">
                  Horário
                </p>
                <p className="mt-2 text-sm text-zinc-100">Terça a domingo</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300">
                  Atendimento
                </p>
                <p className="mt-2 text-sm text-zinc-100">Com hora marcada</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-2xl font-bold text-white">Agendamento rápido</h3>
                <p className="mt-3 text-zinc-300">
                  Escolha horário e barbeiro em poucos cliques.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-2xl font-bold text-white">Produtos premium</h3>
                <p className="mt-3 text-zinc-300">
                  Compre produtos direto pelo site.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-2xl font-bold text-white">Pagamento integrado</h3>
                <p className="mt-3 text-zinc-300">
                  Pague com Mercado Pago de forma segura.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.6rem]">
                  <div className="relative h-[440px] w-full sm:h-[560px] lg:h-[680px]">
                    {corteImages.map((src, index) => (
                      <Image
                        key={src}
                        src={src}
                        alt={`Corte ${index + 1}`}
                        fill
                        priority={index === 0}
                        className={`object-cover transition-all duration-700 ${
                          current === index
                            ? "scale-100 opacity-100"
                            : "scale-105 opacity-0"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />

                  <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-sky-300 backdrop-blur-md">
                      Galeria de cortes
                    </div>

                    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                      {String(current + 1).padStart(2, "0")} / {String(corteImages.length).padStart(2, "0")}
                    </div>
                  </div>

                  <button
                    onClick={prevSlide}
                    type="button"
                    className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-xl text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/60"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextSlide}
                    type="button"
                    className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-xl text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/60"
                    aria-label="Próxima foto"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {corteImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        type="button"
                        className={`h-2.5 rounded-full transition-all ${
                          current === index
                            ? "w-8 bg-sky-400"
                            : "w-2.5 bg-white/50"
                        }`}
                        aria-label={`Ir para foto ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5">
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-5">
                      <h2 className="text-lg font-semibold text-white sm:text-2xl">
                        Cortes reais, resultado de verdade
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-zinc-200 sm:text-sm sm:leading-6">
                        Veja estilos feitos na barbearia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-10 max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-md">
          <p className="text-sm text-zinc-400">© Jak Barber Company</p>

          <a
            href="http://instagram.com/jakcompany_/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-sky-400"
          >
            Instagram
          </a>
        </div>
      </footer>
    </main>
  );
}