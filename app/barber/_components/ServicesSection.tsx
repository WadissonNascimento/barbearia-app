import {
  createBarberServiceAction,
  deleteBarberServiceAction,
  toggleBarberServiceAction,
  updateBarberServiceAction,
} from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

export function ServicesSection({
  services,
}: {
  services: BarberDashboardData["services"];
}) {
  return (
    <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Servicos</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Cadastre, edite e exclua apenas os servicos exclusivos do seu perfil.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          action={createBarberServiceAction}
          className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
        >
          <h3 className="text-lg font-semibold text-white">Novo servico</h3>
          <div className="mt-4 space-y-4">
            <Field label="Nome">
              <input
                name="name"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>

            <Field label="Descricao">
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preco">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="price"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>

              <Field label="Duracao (min)">
                <input
                  type="number"
                  min="10"
                  step="5"
                  name="duration"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#d4a15d] px-4 py-3 font-semibold text-black transition hover:brightness-110"
            >
              Criar servico
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
              Ainda nao ha servicos cadastrados para este barbeiro.
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{service.name}</p>
                    <p className="text-sm text-zinc-400">
                      {service.isActive ? "Ativo para agendamento" : "Indisponivel no momento"}
                    </p>
                  </div>

                  <form action={toggleBarberServiceAction}>
                    <input type="hidden" name="serviceId" value={service.id} />
                    <button
                      type="submit"
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        service.isActive
                          ? "bg-zinc-800 text-white hover:bg-zinc-700"
                          : "bg-green-600 text-white hover:bg-green-500"
                      }`}
                    >
                      {service.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </form>

                  <form action={deleteBarberServiceAction}>
                    <input type="hidden" name="serviceId" value={service.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                    >
                      Excluir
                    </button>
                  </form>
                </div>

                <form action={updateBarberServiceAction} className="grid gap-4">
                  <input type="hidden" name="serviceId" value={service.id} />

                  <Field label="Nome">
                    <input
                      name="name"
                      defaultValue={service.name}
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <Field label="Descricao">
                    <textarea
                      name="description"
                      defaultValue={service.description || ""}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Preco">
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        name="price"
                        defaultValue={service.price}
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                      />
                    </Field>

                    <Field label="Duracao (min)">
                      <input
                        type="number"
                        min="10"
                        step="5"
                        name="duration"
                        defaultValue={service.duration}
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                      />
                    </Field>
                  </div>

                  <button
                    type="submit"
                    className="justify-self-start rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    Salvar alteracoes
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
