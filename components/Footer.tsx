import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-14 border-t border-white/10 bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_36%)]" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Jak Barber"
              width={50}
              height={50}
              className="object-contain"
            />

            <div>
              <p className="text-lg font-bold">Jak Barber</p>
              <p className="text-xs text-zinc-400">Atendimento com hora marcada</p>
            </div>
          </Link>

          <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Funcionamento
              </p>
              <p className="mt-2 text-zinc-200">Terca a domingo, das 09h as 20h</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Experiencia
              </p>
              <p className="mt-2 text-zinc-200">
                Agenda rapida no celular e acompanhamento em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <a
              href="https://www.instagram.com/jakcompany_/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--brand-strong)] transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)] hover:text-[var(--brand-strong)]"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7.75 2C4.57 2 2 4.57 2 7.75v8.5C2 19.43 4.57 22 7.75 22h8.5C19.43 22 22 19.43 22 16.25v-8.5C22 4.57 19.43 2 16.25 2h-8.5zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm4.25 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm4.75-.88a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24z" />
              </svg>
            </a>

            <a
              href="https://maps.google.com/?q=Osasco+SP"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--brand-strong)] transition hover:border-[var(--brand)]/40 hover:bg-[var(--brand-muted)] hover:text-[var(--brand-strong)]"
              aria-label="Localizacao"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Jak Barber Company</p>
          <p className="text-zinc-500">Cuidado em cada detalhe</p>
        </div>
      </div>
    </footer>
  );
}
