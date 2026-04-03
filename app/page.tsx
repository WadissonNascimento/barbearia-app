"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const corteImages = [
  "/cortes/corte1.png",
  "/cortes/corte2.png",
  "/cortes/corte3.png",
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isTouching, setIsTouching] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  function nextSlide() {
    setCurrent((prev) => (prev + 1) % corteImages.length);
  }

  function prevSlide() {
    setCurrent((prev) => (prev - 1 + corteImages.length) % corteImages.length);
  }

  useEffect(() => {
    if (isTouching) return;

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % corteImages.length);
    }, 4500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTouching]);

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setIsTouching(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    setTouchEndX(e.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (touchStartX === null || touchEndX === null) {
      setIsTouching(false);
      return;
    }

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    setTouchStartX(null);
    setTouchEndX(null);
    setIsTouching(false);
  }

  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.10),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              Jak Barber
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Seu estilo,
              <br />
              com hora marcada.
            </h1>

            <p className="mt-4 max-w-xl text-sm text-zinc-300 sm:text-base">
              Agende seu horário com praticidade e conheça nossos produtos em um ambiente simples e moderno.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/agendar"
                className="rounded-2xl bg-sky-500 px-6 py-3 text-center font-semibold text-white transition hover:bg-sky-400 active:scale-[0.98]"
              >
                Agendar horário
              </Link>

              <Link
                href="/produtos"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
              >
                Ver produtos
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <p className="text-xs text-sky-300">Atendimento</p>
                <p className="mt-2 text-sm text-zinc-200">Com hora marcada</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                <p className="text-xs text-sky-300">Local</p>
                <p className="mt-2 text-sm text-zinc-200">Osasco, SP</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div
                  className="relative overflow-hidden rounded-[1.6rem] select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="relative h-[280px] w-full sm:h-[420px] lg:h-[560px]">
                    {corteImages.map((src, index) => (
                      <Image
                        key={src}
                        src={src}
                        alt={`Corte ${index + 1}`}
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
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-sky-500/20 sm:left-4 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-sky-500/20 sm:right-4 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {corteImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrent(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          current === index
                            ? "w-6 bg-sky-400"
                            : "w-2 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] text-zinc-400 sm:text-sm">
                No celular, arraste para os lados para ver mais cortes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}