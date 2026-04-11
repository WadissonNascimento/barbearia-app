"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { LogoutButton } from "@/components/LogoutButton";

type HeaderRole = "ADMIN" | "BARBER" | "CUSTOMER" | null;

type NavLink = {
  href: string;
  label: string;
};

function getHeaderLinks(role: HeaderRole): {
  homeHref: string;
  eyebrow: string;
  primary: NavLink[];
  secondary: NavLink[];
  showCart: boolean;
} {
  if (role === "ADMIN") {
    return {
      homeHref: "/admin",
      eyebrow: "Admin",
      primary: [
        { href: "/admin", label: "Inicio" },
        { href: "/admin/agenda", label: "Agenda" },
        { href: "/admin/barbeiros", label: "Equipe" },
        { href: "/admin/financeiro", label: "Financeiro" },
      ],
      secondary: [
        { href: "/admin/servicos", label: "Servicos" },
        { href: "/admin/produtos", label: "Produtos" },
        { href: "/admin/pedidos", label: "Pedidos" },
        { href: "/admin/cupons", label: "Cupons" },
      ],
      showCart: false,
    };
  }

  if (role === "BARBER") {
    return {
      homeHref: "/barber",
      eyebrow: "Barbeiro",
      primary: [
        { href: "/barber", label: "Hoje" },
        { href: "/barber/agenda", label: "Agenda" },
        { href: "/barber/clientes", label: "Clientes" },
        { href: "/barber/disponibilidade", label: "Pausas" },
      ],
      secondary: [{ href: "/barber/servicos", label: "Meus servicos" }],
      showCart: false,
    };
  }

  if (role === "CUSTOMER") {
    return {
      homeHref: "/customer",
      eyebrow: "Cliente",
      primary: [
        { href: "/agendar", label: "Agendar" },
        { href: "/customer/agendamentos", label: "Meus horarios" },
        { href: "/meus-pedidos", label: "Pedidos" },
      ],
      secondary: [
        { href: "/produtos", label: "Produtos" },
        { href: "/meu-perfil", label: "Meu cadastro" },
        { href: "/rastreio", label: "Rastreio" },
      ],
      showCart: true,
    };
  }

  return {
    homeHref: "/",
    eyebrow: "JakCompany",
    primary: [
      { href: "/agendar", label: "Agendar" },
      { href: "/produtos", label: "Produtos" },
      { href: "/login", label: "Entrar" },
    ],
    secondary: [
      { href: "/register", label: "Criar conta" },
      { href: "/rastreio", label: "Rastreio" },
    ],
    showCart: true,
  };
}

function isActivePath(pathname: string, href: string) {
  if (["/", "/admin", "/barber", "/customer"].includes(href)) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({
  role,
  userName,
}: {
  role: HeaderRole;
  userName?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const pathname = usePathname();
  const nav = getHeaderLinks(role);

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

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-white/10 bg-[#030712]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href={nav.homeHref} className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Jak Barber"
              width={120}
              height={50}
              className="h-auto w-[108px] object-contain sm:w-[120px]"
              priority
            />
            {role ? (
              <span className="hidden max-w-[150px] truncate text-xs text-zinc-400 sm:inline">
                {userName || nav.eyebrow}
              </span>
            ) : null}
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              {nav.primary.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActivePath(pathname, link.href)
                      ? "bg-[var(--brand-muted)] text-white"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {nav.showCart ? (
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
            ) : null}

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
            {nav.eyebrow}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-2">
            {nav.primary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`w-full rounded-2xl px-5 py-3 text-sm font-semibold transition active:scale-[0.98] ${
                  isActivePath(pathname, link.href)
                  ? "bg-[var(--brand)] text-white shadow-[0_12px_24px_rgba(37,99,235,0.35)]"
                    : "border border-white/10 bg-white/[0.04] text-white hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-2 border-t border-white/10 pt-3">
            {nav.secondary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)] active:scale-[0.98]"
              >
                {link.label}
              </Link>
            ))}
            {role ? (
              <div className="pt-1">
                <LogoutButton />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
