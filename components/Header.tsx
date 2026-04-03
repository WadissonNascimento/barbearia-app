"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <header className="relative z-[100] w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Jak Barber"
              width={120}
              height={50}
              className="h-auto w-auto object-contain"
              priority
            />
          </Link>

          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-white transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-95"
          >
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ${
                isOpen ? "rotate-45" : "-translate-y-[6px]"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ${
                isOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ${
                isOpen ? "-rotate-45" : "translate-y-[6px]"
              }`}
            />
          </button>
        </div>
      </header>

      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-[140] bg-black/45 backdrop-blur-[2px] transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed right-4 top-[84px] z-[150] w-[270px] rounded-3xl border border-white/10 bg-[#060b16]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-sm font-semibold text-white">Menu</p>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-300">
            Mobile
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Link
            href="/agendar"
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl bg-sky-500 px-5 py-3 text-right text-sm font-semibold text-white transition hover:bg-sky-400 active:scale-[0.98]"
          >
            Agendamento
          </Link>

          <Link
            href="/produtos"
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-right text-sm text-white transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-[0.98]"
          >
            Produtos
          </Link>

          <Link
            href="/painel"
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-right text-sm text-white transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-[0.98]"
          >
            Painel
          </Link>

          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-right text-sm text-white transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-[0.98]"
          >
            Entrar
          </Link>
        </div>
      </div>
    </>
  );
}