"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const primaryLinks = [
    { href: "/agendar", label: "Agendar" },
    { href: "/produtos", label: "Produtos" },
    { href: "/painel", label: "Painel" },
  ];

  const secondaryLinks = [
    { href: "/meu-perfil", label: "Meu perfil" },
    { href: "/rastreio", label: "Rastreio" },
    { href: "/login", label: "Entrar" },
  ];

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-[#030712]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Jak Barber"
              width={120}
              height={50}
              className="h-auto w-[108px] object-contain sm:w-[120px]"
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    pathname === link.href
                      ? "bg-[var(--brand-muted)] text-white"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/carrinho"
              className="relative rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)]"
            >
              Carrinho
              {cartCount > 0 && (
                <span className="ml-2 rounded-full bg-[var(--brand)] px-2 py-0.5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.32)]">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setIsOpen((prev) => !prev)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] text-white transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)] active:scale-95"
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
        className={`fixed inset-x-4 top-[76px] z-[150] rounded-3xl border border-white/10 bg-[#030712]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 sm:left-auto sm:right-4 sm:top-[84px] sm:w-[320px] ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-sm font-semibold text-white">Menu</p>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--brand-strong)]">
            JakCompany
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-2">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                  pathname === link.href
                  ? "bg-[var(--brand)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.35)]"
                    : "border border-white/10 bg-white/[0.04] text-white hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-2 border-t border-white/10 pt-3">
            {secondaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)] active:scale-[0.98]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
