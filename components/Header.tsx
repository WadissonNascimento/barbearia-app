import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-wide text-white">
          BarberPro
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-300">
          <Link href="/agendar">Agendar</Link>
          <Link href="/produtos">Produtos</Link>
          <Link href="/admin">Painel</Link>
        </nav>
      </div>
    </header>
  );
}
