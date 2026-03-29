import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";

const corteImages = [
  "/cortes/corte1.png",
  "/cortes/corte2.png",
  "/cortes/corte3.png",
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="grid gap-3 sm:grid-cols-3">
                  {corteImages.map((src, index) => (
                    <div
                      key={src}
                      className="relative overflow-hidden rounded-[1.6rem] border border-white/10"
                    >
                      <div className="relative h-[320px] w-full sm:h-[420px] lg:h-[520px]">
                        <Image
                          src={src}
                          alt={`Corte ${index + 1}`}
                          fill
                          priority={index === 0}
                          className="object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-5">
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

          <div className="order-2 lg:order-1">
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">
              Seu estilo começa aqui.
            </h1>

            <p className="mt-4 text-sm text-zinc-300 sm:text-base">
              Agende seu horário com praticidade, compre produtos e tenha uma
              experiência premium na Jak Barber Company.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/agendar"
                className="rounded-2xl bg-sky-500 px-6 py-3 text-center font-semibold text-white transition hover:bg-sky-400"
              >
                Agendar horário
              </Link>

              <Link
                href="/produtos"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-white transition hover:bg-white/[0.08]"
              >
                Ver produtos
              </Link>

              {!session?.user && (
                <Link
                  href="/login"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-white transition hover:bg-white/[0.08]"
                >
                  Entrar
                </Link>
              )}

              {session?.user && (
                <Link
                  href="/painel"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-white transition hover:bg-white/[0.08]"
                >
                  Ir para o painel
                </Link>
              )}
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

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Agendamento rápido
                </h3>
                <p className="text-zinc-400">
                  Escolha horário e barbeiro em poucos cliques.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Produtos premium
                </h3>
                <p className="text-zinc-400">
                  Compre produtos direto pelo site.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Pagamento integrado
                </h3>
                <p className="text-zinc-400">
                  Pague com Mercado Pago de forma segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-10 max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-sm text-zinc-400">© Jak Barber Company</p>

          <a
            href="http://instagram.com/jakcompany_/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-sky-400"
          >
            Instagram
          </a>
        </div>
      </footer>
    </main>
  );
}