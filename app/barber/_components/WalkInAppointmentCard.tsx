"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import { formatCurrency } from "@/lib/utils";
import { createWalkInAppointmentAction } from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

type WalkInAppointmentCardProps = {
  services: BarberDashboardData["walkInServices"];
  nextAppointmentDate: Date | null;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getRoundedStartTime() {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 5) * 5;
  now.setMinutes(roundedMinutes, 0, 0);

  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGapLabel(nextAppointmentDate: Date | null) {
  if (!nextAppointmentDate) {
    return "Sem proximo atendimento hoje.";
  }

  const diffMinutes = Math.max(
    0,
    Math.floor((new Date(nextAppointmentDate).getTime() - Date.now()) / 60000)
  );

  return `${diffMinutes} min livres ate ${formatTime(nextAppointmentDate)}.`;
}

export default function WalkInAppointmentCard({
  services,
  nextAppointmentDate,
}: WalkInAppointmentCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [isPending, startTransition] = useTransition();
  const startTime = useMemo(() => getRoundedStartTime(), []);
  const defaultService = services[0];

  return (
    <div className="min-w-0 overflow-hidden rounded-[28px] border border-[var(--brand)]/30 bg-[var(--brand-muted)]/20 p-4 backdrop-blur sm:p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-strong)]">
          Encaixe
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Aproveitar horario livre
        </h2>
        <p className="mt-1 text-sm text-zinc-300">
          {getGapLabel(nextAppointmentDate)}
        </p>
      </div>

      <div className="mt-4">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      {services.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-400">
          Cadastre um servico ativo antes de criar encaixes.
        </p>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const formData = new FormData(form);

            startTransition(async () => {
              const result = await createWalkInAppointmentAction(formData);
              setFeedback({ message: result.message, tone: result.tone });

              if (result.ok) {
                form.reset();
                router.refresh();
              }
            });
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Cliente</span>
            <input
              name="customerName"
              required
              maxLength={80}
              placeholder="Nome do cliente"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Telefone</span>
            <input
              name="customerPhone"
              maxLength={30}
              placeholder="Opcional"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Servico</span>
              <select
                name="serviceId"
                required
                defaultValue={defaultService?.id}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration} min - {formatCurrency(service.price)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Inicio</span>
              <input
                name="startTime"
                type="time"
                required
                defaultValue={startTime}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">Observacao</span>
            <textarea
              name="notes"
              rows={2}
              maxLength={200}
              placeholder="Opcional"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 w-full rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Criando encaixe..." : "Criar encaixe"}
          </button>
        </form>
      )}
    </div>
  );
}

