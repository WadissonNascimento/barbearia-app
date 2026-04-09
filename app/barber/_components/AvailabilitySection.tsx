import EmptyState from "@/components/ui/EmptyState";
import SectionCard from "@/components/ui/SectionCard";
import { weekDays } from "@/lib/barberSchedule";
import { WeeklyAvailabilityForm } from "./WeeklyAvailabilityForm";
import {
  createBarberBlockAction,
  createRecurringBarberBlockAction,
  deleteBarberBlockAction,
  deleteRecurringBarberBlockAction,
} from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

export function AvailabilitySection({
  availabilities,
  blocks,
  recurringBlocks,
  redirectTo,
}: {
  availabilities: BarberDashboardData["availabilities"];
  blocks: BarberDashboardData["blocks"];
  recurringBlocks: BarberDashboardData["recurringBlocks"];
  redirectTo: string;
}) {
  return (
    <SectionCard
      title="Disponibilidade"
      description="Defina seus horarios da semana e bloqueie pausas ou ausencias pontuais."
      className="rounded-[28px] bg-zinc-900/90"
    >
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <WeeklyAvailabilityForm availabilities={availabilities} redirectTo={redirectTo} />

        <div className="space-y-4">
          <form
            action={createBarberBlockAction}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />
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
                <EmptyState
                  title="Nenhum bloqueio futuro"
                  description="Use bloqueios para almoco, folga, curso ou qualquer pausa pontual."
                />
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
                      <input type="hidden" name="redirectTo" value={redirectTo} />
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

          <form
            action={createRecurringBarberBlockAction}
            className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <h3 className="text-lg font-semibold text-white">Bloqueio recorrente</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Use para almoco, pausa fixa ou horarios indisponiveis que se repetem toda semana.
            </p>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Dia da semana</span>
                <select
                  name="weekDay"
                  defaultValue=""
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {weekDays.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Inicio</span>
                  <input
                    type="time"
                    name="startTime"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-zinc-300">Fim</span>
                  <input
                    type="time"
                    name="endTime"
                    required
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-zinc-300">Motivo</span>
                <input
                  name="reason"
                  placeholder="Ex.: almoco fixo"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#d4a15d] px-4 py-3 font-semibold text-black transition hover:brightness-110"
              >
                Criar bloqueio recorrente
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <h3 className="text-lg font-semibold text-white">Bloqueios recorrentes</h3>

            <div className="mt-4 space-y-3">
              {recurringBlocks.length === 0 ? (
                <EmptyState
                  title="Nenhum bloqueio recorrente"
                  description="Configure pausas fixas da semana para evitar reservas nesses periodos."
                />
              ) : (
                recurringBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                  >
                    <p className="text-sm font-medium text-white">
                      {weekDays.find((day) => day.value === block.weekDay)?.label || "Dia"}:{" "}
                      {block.startTime} ate {block.endTime}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {block.reason || "Sem motivo informado"}
                    </p>

                    <form action={deleteRecurringBarberBlockAction} className="mt-3">
                      <input type="hidden" name="redirectTo" value={redirectTo} />
                      <input type="hidden" name="recurringBlockId" value={block.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                      >
                        Remover bloqueio recorrente
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
