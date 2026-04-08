import { WeeklyAvailabilityForm } from "./WeeklyAvailabilityForm";
import {
  createBarberBlockAction,
  deleteBarberBlockAction,
} from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

export function AvailabilitySection({
  availabilities,
  blocks,
}: {
  availabilities: BarberDashboardData["availabilities"];
  blocks: BarberDashboardData["blocks"];
}) {
  return (
    <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div>
        <h2 className="text-2xl font-semibold text-white">Disponibilidade</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Defina seus horarios da semana e bloqueie pausas ou ausencias pontuais.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <WeeklyAvailabilityForm availabilities={availabilities} />

        <div className="space-y-4">
          <form
            action={createBarberBlockAction}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
          >
            <h3 className="text-lg font-semibold text-white">Bloquear periodo</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Use para folga, pausa, almoco ou qualquer indisponibilidade.
            </p>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Inicio</span>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Fim</span>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Motivo</span>
                <input
                  name="reason"
                  placeholder="Ex.: almoco, curso, folga"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#d4a15d] px-4 py-3 font-semibold text-black transition hover:brightness-110"
              >
                Bloquear horario
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">Bloqueios futuros</h3>

            <div className="mt-4 space-y-3">
              {blocks.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum bloqueio cadastrado.</p>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                  >
                    <p className="text-sm font-medium text-white">
                      {new Date(block.startDateTime).toLocaleString("pt-BR")} ate{" "}
                      {new Date(block.endDateTime).toLocaleString("pt-BR")}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {block.reason || "Sem motivo informado"}
                    </p>

                    <form action={deleteBarberBlockAction} className="mt-3">
                      <input type="hidden" name="blockId" value={block.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        Remover bloqueio
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
