"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import EmptyState from "@/components/ui/EmptyState";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  getAppointmentDisplayName,
  getAppointmentServiceMetaLine,
} from "@/lib/appointmentServices";
import {
  appointmentStatusLabel,
  appointmentStatusVariant,
} from "@/lib/appointmentStatus";
import { updateAppointmentStatusAction } from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

type AppointmentsSectionProps = {
  appointments: BarberDashboardData["appointments"];
  filters: BarberDashboardData["filters"];
};

function formatDateTime(value: Date) {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function AppointmentsSection({
  appointments,
  filters,
}: AppointmentsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [isFilterPending, startFilterTransition] = useTransition();
  const [selectedView, setSelectedView] = useState(filters.view);
  const [selectedStatus, setSelectedStatus] = useState(filters.status);
  const [selectedDate, setSelectedDate] = useState(filters.date);

  const filterDefaults = useMemo(
    () => ({
      view: filters.view,
      status: filters.status,
      date: filters.date,
    }),
    [filters.date, filters.status, filters.view]
  );

  useEffect(() => {
    setSelectedView(filterDefaults.view);
    setSelectedStatus(filterDefaults.status);
    setSelectedDate(filterDefaults.date);
  }, [filterDefaults.date, filterDefaults.status, filterDefaults.view]);

  function applyFilters() {
    const params = new URLSearchParams();
    const view = selectedView || "day";
    const status = selectedStatus || "ALL";
    const date = selectedDate || "";

    if (view && view !== "day") {
      params.set("view", view);
    }

    if (status && status !== "ALL") {
      params.set("status", status);
    }

    if (view === "day" && date) {
      params.set("date", date);
    }

    startFilterTransition(() => {
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false }
      );
    });
  }

  return (
    <SectionCard
      title="Agenda"
      description="Veja apenas seus atendimentos e atualize o andamento do dia."
      className="rounded-[28px] bg-zinc-900/90"
      actions={
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <select
            name="view"
            value={selectedView}
            onChange={(event) => setSelectedView(event.target.value as typeof filters.view)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="day">Dia</option>
            <option value="upcoming">Proximos</option>
            <option value="all">Todos</option>
          </select>

          <select
            name="status"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="ALL">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="COMPLETED">Concluido</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="NO_SHOW">Nao compareceu</option>
          </select>

          <input
            type="date"
            name="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            disabled={selectedView !== "day"}
            className={`rounded-xl border px-4 py-3 text-sm text-white outline-none ${
              selectedView === "day"
                ? "border-zinc-700 bg-zinc-950"
                : "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-500"
            }`}
          />

          <button
            type="submit"
            disabled={isFilterPending}
            className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-3"
          >
            {isFilterPending ? "Atualizando..." : "Atualizar filtros"}
          </button>

          {selectedView !== "day" ? (
            <p className="text-xs text-zinc-500 sm:col-span-3">
              A data so vale quando o filtro estiver em Dia.
            </p>
          ) : null}
        </form>
      }
    >
      <div className="mt-6 space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      <div className="mt-6 space-y-4">
        {appointments.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento encontrado"
            description="Ajuste os filtros acima para ver outros horarios ou volte mais tarde."
          />
        ) : (
          appointments.map((appointment) => {
            const { date, time } = formatDateTime(appointment.date);

            return (
              <div
                key={appointment.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Cliente
                    </p>
                    <Link
                      href={`/barber/clientes/${appointment.customer.id}`}
                      className="mt-2 block text-lg font-medium text-white transition hover:text-[var(--brand)]"
                    >
                      {appointment.customer.name || "Cliente"}
                    </Link>
                    <p className="mt-1 text-sm text-zinc-400">
                      {appointment.customer.phone || appointment.customer.email || "Sem contato"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Servico
                    </p>
                    <p className="mt-2 text-white">
                      {getAppointmentDisplayName(appointment.services)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {getAppointmentServiceMetaLine(appointment.services)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Data
                    </p>
                    <p className="mt-2 text-white">{date}</p>
                    <p className="mt-1 text-sm text-zinc-400">{time}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
                        {appointmentStatusLabel(appointment.status)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">
                      {appointment.notes || "Sem observacoes"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/barber/clientes/${appointment.customer.id}`}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                    >
                      Ver perfil
                    </Link>

                    {appointment.status === "PENDING" && (
                      <>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CONFIRMED"
                          className="bg-green-600 text-white hover:bg-green-500"
                          onFeedback={setFeedback}
                        >
                          Confirmar
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CANCELLED"
                          className="bg-red-600 text-white hover:bg-red-500"
                          onFeedback={setFeedback}
                        >
                          Cancelar
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="NO_SHOW"
                          className="bg-orange-500 text-black hover:bg-orange-400"
                          onFeedback={setFeedback}
                        >
                          Nao veio
                        </StatusButton>
                      </>
                    )}

                    {appointment.status === "CONFIRMED" && (
                      <>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="COMPLETED"
                          className="bg-sky-600 text-white hover:bg-sky-500"
                          onFeedback={setFeedback}
                        >
                          Concluir
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="NO_SHOW"
                          className="bg-orange-500 text-black hover:bg-orange-400"
                          onFeedback={setFeedback}
                        >
                          Nao veio
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CANCELLED"
                          className="bg-red-600 text-white hover:bg-red-500"
                          onFeedback={setFeedback}
                        >
                          Cancelar
                        </StatusButton>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}

function StatusButton({
  appointmentId,
  status,
  className,
  children,
  onFeedback,
}: {
  appointmentId: string;
  status: string;
  className: string;
  children: ReactNode;
  onFeedback: (feedback: {
    message: string | null;
    tone: "success" | "error" | "info";
  }) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const formData = new FormData();
          formData.set("appointmentId", appointmentId);
          formData.set("status", status);

          const result = await updateAppointmentStatusAction(formData);
          onFeedback({ message: result.message, tone: result.tone });

          if (result.ok) {
            router.refresh();
          }
        });
      }}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isPending ? "Salvando..." : children}
    </button>
  );
}
