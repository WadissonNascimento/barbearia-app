"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const corteImages = [
  "/cortes/corte1.png",
  "/cortes/corte2.png",
  "/cortes/corte3.png",
];

const testimonials = [
  {
    name: "Andre N.",
    text: "Agendei em poucos cliques e o corte saiu exatamente como eu queria.",
  },
  {
    name: "Carlos E.",
    text: "Atendimento pontual, ambiente limpo e acabamento muito caprichado.",
  },
  {
    name: "Rafael M.",
    text: "A loja tambem facilita bastante para manter os produtos em casa.",
  },
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
    if (isTouching) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % corteImages.length);
    }, 4500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTouching]);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    setIsTouching(true);
    setTouchEndX(null);
    setTouchStartX(event.targetTouches[0].clientX);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    setTouchEndX(event.targetTouches[0].clientX);
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
    <main className="relative min-h-screen text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="order-2 lg:order-1">
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Seu estilo comeca aqui.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-300 sm:text-base">
              Agende seu horario com praticidade e tenha uma experiencia premium
              na JakCompany.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/agendar"
                className="rounded-2xl bg-[var(--brand)] px-6 py-3 text-center font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                Agendar horario
              </Link>

              <Link
                href="/produtos"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-white transition hover:bg-white/[0.08] active:scale-[0.98]"
              >
                Ver produtos
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="surface-card rounded-3xl p-4">
                <p className="text-xs text-[var(--brand-strong)]">Local</p>
                <p className="mt-2 text-sm text-zinc-200">Osasco, SP</p>
              </div>

              <div className="surface-card rounded-3xl p-4">
                <p className="text-xs text-[var(--brand-strong)]">Horario</p>
                <p className="mt-2 text-sm text-zinc-200">Terca a domingo</p>
              </div>

              <div className="surface-card rounded-3xl p-4">
                <p className="text-xs text-[var(--brand-strong)]">Atendimento</p>
                <p className="mt-2 text-sm text-zinc-200">Com hora marcada</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

              <div className="surface-card-strong relative overflow-hidden rounded-[2rem] p-2">
                <div
                  className="relative overflow-hidden rounded-[1.6rem] select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="relative h-[440px] w-full sm:h-[560px] lg:h-[680px]">
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
                    className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-[var(--brand-muted)] sm:left-4 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    {"<"}
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-lg text-white backdrop-blur-xl transition hover:bg-[var(--brand-muted)] sm:right-4 sm:h-12 sm:w-12 sm:text-xl"
                  >
                    {">"}
                  </button>

                  <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {corteImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrent(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          current === index
                            ? "w-6 bg-[var(--brand)]"
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

                      <p className="mt-2 text-xs text-zinc-300 sm:text-sm">
                        Veja estilos feitos na barbearia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] text-zinc-400 sm:text-sm">
                No celular, arraste para os lados para ver os cortes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Experiencia
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Quem vem, volta.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">
            Atendimento com horario marcado, servico bem feito e tudo organizado
            para voce nao perder tempo.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className="text-sm tracking-[0.18em] text-[var(--brand-strong)]">
                5/5
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">
                {testimonial.text}
              </p>
              <p className="mt-5 text-sm font-semibold text-white">
                {testimonial.name}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
