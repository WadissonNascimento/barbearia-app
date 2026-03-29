"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="JakCompany"
            width={200}
            height={200}
            className="h-auto w-40 object-contain md:w-52"
          />
        </Link>

        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex flex-col gap-1.5 rounded-md p-2 text-white transition hover:bg-zinc-900"
        >
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
          <span className="block h-0.5 w-6 bg-white" />
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4">
          <nav className="flex flex-col gap-3 text-white">
            <Link
              href="/agendar"
              className="rounded-lg px-3 py-2 transition hover:bg-zinc-900"
              onClick={() => setOpen(false)}
            >
              Agendamento
            </Link>

            <Link
              href="/produtos"
              className="rounded-lg px-3 py-2 transition hover:bg-zinc-900"
              onClick={() => setOpen(false)}
            >
              Produtos
            </Link>

            <Link
              href="/painel"
              className="rounded-lg px-3 py-2 transition hover:bg-zinc-900"
              onClick={() => setOpen(false)}
            >
              Painel
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}