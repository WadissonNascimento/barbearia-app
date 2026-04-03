import Link from "next/link";

export default function PainelPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            Painel
          </span>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Seu painel
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Acompanhe agendamentos, produtos e acessos rápidos em um ambiente
            mais organizado e visualmente premium.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.20),_transparent_45%)] blur-2xl" />

              <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                      Visão geral
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Bem-vindo ao painel
                    </h2>
                    <p className="mt-2 max-w-xl text-sm text-zinc-300">
                      Gerencie sua operação com mais praticidade e acompanhe os
                      principais dados em um só lugar.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                    Atualizado agora
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.22)]">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                  Agendamentos
                </p>
                <p className="mt-3 text-3xl font-bold text-white">12</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Horários cadastrados no sistema.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.22)]">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                  Produtos
                </p>
                <p className="mt-3 text-3xl font-bold text-white">4</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Itens exibidos na vitrine digital.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.22)]">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                  Clientes
                </p>
                <p className="mt-3 text-3xl font-bold text-white">28</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Pessoas atendidas recentemente.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/agendar"
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.22)] transition hover:bg-white/[0.06] active:scale-[0.99]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                  Acesso rápido
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  Novo agendamento
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Cadastre rapidamente um novo horário no sistema.
                </p>
              </Link>

              <Link
                href="/produtos"
                className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.22)] transition hover:bg-white/[0.06] active:scale-[0.99]"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                  Acesso rápido
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  Ver produtos
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  Acesse a vitrine digital e acompanhe os itens disponíveis.
                </p>
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="rounded-2xl border border-sky-400/15 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Resumo do dia
            </div>

            <h3 className="mt-4 text-2xl font-semibold text-white">
              Próximas ações
            </h3>

            <div className="mt-6 space-y-4">
              {[
                "Confirmar os próximos horários agendados.",
                "Revisar produtos em destaque na vitrine.",
                "Acompanhar pagamentos e movimentações.",
                "Atualizar horários disponíveis no sistema.",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">
                Use o painel para centralizar sua operação e manter a experiência
                do cliente mais organizada.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}