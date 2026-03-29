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

          {/* CARROSSEL */}
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

                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2"
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {corteImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2 rounded-full ${
                          current === index
                            ? "w-6 bg-sky-400"
                            : "w-2 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5">
                    <div className="rounded-[1.4rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-5">
                      <h2 className="text-lg font-semibold sm:text-2xl">
                        Cortes reais, resultado de verdade
                      </h2>

                      <p className="mt-2 text-xs sm:text-sm text-zinc-300">
                        Veja estilos feitos na barbearia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TEXTO */}
          <div className="order-2 lg:order-1">
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Seu estilo começa aqui.
            </h1>

            <p className="mt-4 text-sm text-zinc-300 sm:text-base">
              Agende seu horário com praticidade e tenha uma experiência premium
              na JakCompany.
            </p>

            <div className="mt-6">
              <Link
                href="/agendar"
                className="rounded-2xl bg-sky-500 px-6 py-3 text-center font-semibold text-white hover:bg-sky-400"
              >
                Agendar horário
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-sky-300">Local</p>
                <p className="mt-2 text-sm">Osasco, SP</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-sky-300">Horário</p>
                <p className="mt-2 text-sm">Terça a domingo</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs text-sky-300">Atendimento</p>
                <p className="mt-2 text-sm">Com hora marcada</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* RODAPÉ SIMPLES */}
      <footer className="mx-auto mt-10 max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-sm text-zinc-400">
            © Jak Barber Company
          </p>

          <a
            href="http://instagram.com/jakcompany_/"
            target="_blank"
            className="text-sky-400 text-sm font-semibold"
          >
            Instagram
          </a>
        </div>
      </footer>

    </main>
  );
}