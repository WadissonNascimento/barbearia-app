import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const agendamentos = [
  {
    id: 1,
    servico: "Corte",
    barbeiro: "Jak",
    data: "12/04/2026",
    horario: "14:00",
  },
  {
    id: 2,
    servico: "Barba",
    barbeiro: "Ryan",
    data: "18/04/2026",
    horario: "10:30",
  },
];

const produtos = [
  {
    id: 1,
    nome: "Pomada Modeladora",
    preco: "R$ 39,90",
    href: "/produtos",
  },
  {
    id: 2,
    nome: "Óleo para Barba",
    preco: "R$ 34,90",
    href: "/produtos",
  },
  {
    id: 3,
    nome: "Shampoo Premium",
    preco: "R$ 44,90",
    href: "/produtos",
  },
];

export default function CustomerPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              Cliente
            </span>

            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Painel do Cliente
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
              Veja seus horários marcados, acesse produtos e reagende com
              praticidade.
            </p>
          </div>

          <LogoutButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                Bem-vindo
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Ryan Ramos Martins
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Aqui você acompanha seus agendamentos e acessa ações rápidas.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                    Meus agendamentos
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Horários marcados
                  </h3>
                </div>

                <Link
                  href="/agendar"
                  className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 active:scale-[0.98]"
                >
                  Novo agendamento
                </Link>
              </div>

              <div className="space-y-4">
                {agendamentos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {item.servico}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                          Barbeiro: {item.barbeiro}
                        </p>
                        <p className="mt-2 text-sm text-zinc-300">
                          {item.data} às {item.horario}
                        </p>
                      </div>

                      <Link
                        href="/agendar"
                        className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-[0.98]"
                      >
                        Reagendar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
              Produtos
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Itens disponíveis
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Toque em um produto para abrir a vitrine.
            </p>

            <div className="mt-6 space-y-4">
              {produtos.map((produto) => (
                <Link
                  key={produto.id}
                  href={produto.href}
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-sky-400/40 hover:bg-sky-500/10 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{produto.nome}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {produto.preco}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-sky-300">
                      Ver
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}