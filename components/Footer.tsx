import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#030712] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_40%)]" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row">
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
              <p className="text-xs text-zinc-400">Company</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="http://instagram.com/jakcompany_/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-400 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-300 hover:shadow-[0_0_12px_rgba(56,189,248,0.5)]"
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
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 text-sm text-zinc-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Jak Barber Company</p>
          <p className="text-zinc-500">Cuidado em cada detalhe</p>
        </div>
      </div>
    </footer>
  );
}