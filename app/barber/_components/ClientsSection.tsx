import Link from "next/link";
import { saveClientNoteAction } from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

export function ClientsSection({
  clients,
}: {
  clients: BarberDashboardData["clients"];
}) {
  return (
    <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div>
        <h2 className="text-2xl font-semibold text-white">Clientes</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Consulte quem ja passou pela sua cadeira e salve observacoes uteis.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <form
          action="/barber/clientes"
          className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              name="q"
              placeholder="Pesquisar cliente por nome, email ou telefone"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#d4a15d] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Pesquisar cliente
            </button>
          </div>
        </form>

        {clients.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Seus clientes aparecerao aqui conforme novos atendimentos forem feitos.
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
            >
              <div className="grid gap-4 xl:grid-cols-[1fr_170px_190px_1.3fr]">
                <div>
                  <Link
                    href={`/barber/clientes/${client.id}`}
                    className="text-lg font-semibold text-white transition hover:text-[#d4a15d]"
                  >
                    {client.name}
                  </Link>
                  <p className="mt-1 text-sm text-zinc-400">
                    {client.phone || client.email || "Contato nao informado"}
                  </p>
                  <Link
                    href={`/barber/clientes/${client.id}`}
                    className="mt-3 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d4a15d] hover:text-[#d4a15d]"
                  >
                    Abrir perfil
                  </Link>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    Ultimo atendimento
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(client.lastAppointment).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    Total de atendimentos
                  </p>
                  <p className="mt-2 text-sm text-white">{client.totalAppointments}</p>
                </div>

                <form action={saveClientNoteAction}>
                  <input type="hidden" name="customerId" value={client.id} />
                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-300">Observacao</span>
                    <textarea
                      name="note"
                      defaultValue={client.note}
                      rows={3}
                      placeholder="Preferencias, alergias, estilo recorrente..."
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-3 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Salvar observacao
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
