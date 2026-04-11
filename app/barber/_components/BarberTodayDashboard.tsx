"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  CalendarRange,
  Clock3,
  DollarSign,
  Scissors,
  UserRound,
  Users,
} from "lucide-react";
import FeedbackMessage from "@/components/FeedbackMessage";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  appointmentStatusLabel,
  appointmentStatusVariant,
} from "@/lib/appointmentStatus";
import { formatCurrency } from "@/lib/utils";
import { updateAppointmentStatusAction } from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;
type TodayAppointment = BarberDashboardData["summary"]["todayAppointments"][number];

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function BarberTodayDashboard({
  barberName,
  summary,
}: {
  barberName: string;
  summary: BarberDashboardData["summary"];
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(summary.todayAppointments);
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => !["CANCELLED", "NO_SHOW"].includes(appointment.status)
      ),
    [appointments]
  );
  const nextAppointment =
    visibleAppointments.find(
      (appointment) =>
        new Date(appointment.date).getTime() >= Date.now() &&
        !["COMPLETED"].includes(appointment.status)
    ) || visibleAppointments[0] || null;

  function updateStatus(appointment: TodayAppointment, status: string) {
    setPendingKey(`${appointment.id}-${status}`);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("appointmentId", appointment.id);
      formData.set("status", status);

      const result = await updateAppointmentStatusAction(formData);
      setFeedback({ message: result.message, tone: result.tone });

      if (result.ok) {
        setAppointments((current) =>
          current.map((item) =>
            item.id === appointment.id ? { ...item, status } : item
          )
        );
        router.refresh();
      }

      setPendingKey(null);
    });
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
              Hoje
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
              {barberName.split(" ")[0]}, sua agenda
            </h1>
            <p className="mt-2 text-sm capitalize text-zinc-400">
              {formatTodayLabel()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
            <QuickLink href="/barber/agenda" icon={<CalendarRange />}>
              Agenda
            </QuickLink>
            <QuickLink href="/barber/disponibilidade" icon={<Clock3 />}>
              Pausar
            </QuickLink>
            <QuickLink href="/barber/clientes" icon={<Users />}>
              Clientes
            </QuickLink>
            <QuickLink href="/barber/servicos" icon={<Scissors />}>
              Servicos
            </QuickLink>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<CalendarRange />}
            label="Atendimentos"
            value={`${appointments.length}`}
            helper={`${summary.completedToday} concluidos`}
          />
          <MetricCard
            icon={<UserRound />}
            label="Clientes"
            value={`${summary.clientsToday}`}
            helper="passam hoje"
          />
          <MetricCard
            icon={<DollarSign />}
            label="Previsto"
            value={formatCurrency(summary.scheduledRevenueToday)}
            helper="agenda ativa"
          />
          <MetricCard
            icon={<DollarSign />}
            label="Seu repasse"
            value={formatCurrency(summary.barberPayoutToday)}
            helper="concluido hoje"
          />
        </div>
      </div>

      <FeedbackMessage message={feedback.message} tone={feedback.tone} />

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Agenda do dia</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Horario, cliente e proxima acao.
              </p>
            </div>
            <Link
              href="/barber/agenda"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)]"
            >
              Ver tudo
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-zinc-400">
                Nenhum horario para hoje.
              </div>
            ) : (
              appointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className={`rounded-2xl border p-4 transition ${
                    appointment.id === nextAppointment?.id
                      ? "border-[var(--brand)]/50 bg-[var(--brand-muted)]"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-white">
                        {formatTime(appointment.date)}
                      </p>
                      <Link
                        href={`/barber/clientes/${appointment.customer.id}`}
                        className="mt-2 block truncate text-base font-semibold text-white hover:text-[var(--brand-strong)]"
                      >
                        {appointment.customer.name}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-400">
                        {appointment.serviceName}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {appointment.serviceMeta}
                      </p>
                    </div>
                    <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
                      {appointmentStatusLabel(appointment.status)}
                    </StatusBadge>
                  </div>

                  {appointment.notes ? (
                    <p className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
                      {appointment.notes}
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {appointment.status === "PENDING" ? (
                      <ActionButton
                        pending={isPending && pendingKey === `${appointment.id}-CONFIRMED`}
                        onClick={() => updateStatus(appointment, "CONFIRMED")}
                      >
                        Confirmar
                      </ActionButton>
                    ) : null}
                    {appointment.status === "CONFIRMED" ? (
                      <ActionButton
                        pending={isPending && pendingKey === `${appointment.id}-COMPLETED`}
                        onClick={() => updateStatus(appointment, "COMPLETED")}
                      >
                        Concluir
                      </ActionButton>
                    ) : null}
                    {["PENDING", "CONFIRMED"].includes(appointment.status) ? (
                      <>
                        <ActionButton
                          variant="ghost"
                          pending={isPending && pendingKey === `${appointment.id}-NO_SHOW`}
                          onClick={() => updateStatus(appointment, "NO_SHOW")}
                        >
                          Nao veio
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          pending={isPending && pendingKey === `${appointment.id}-CANCELLED`}
                          onClick={() => updateStatus(appointment, "CANCELLED")}
                        >
                          Cancelar
                        </ActionButton>
                      </>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
            <h2 className="text-xl font-semibold text-white">Proximo horario</h2>
            {nextAppointment ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-4xl font-bold text-white">
                  {formatTime(nextAppointment.date)}
                </p>
                <p className="mt-3 font-semibold text-white">
                  {nextAppointment.customer.name}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {nextAppointment.serviceName}
                </p>
                <Link
                  href={`/barber/clientes/${nextAppointment.customer.id}`}
                  className="mt-4 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Abrir cliente
                </Link>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-4 text-sm text-zinc-400">
                Sem proximos horarios hoje.
              </p>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur sm:p-5">
            <h2 className="text-xl font-semibold text-white">Servicos do dia</h2>
            <div className="mt-4 space-y-3">
              {summary.todayServices.length === 0 ? (
                <p className="text-sm text-zinc-400">Sem servicos agendados.</p>
              ) : (
                summary.todayServices.slice(0, 5).map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-white">{service.name}</p>
                    <span className="rounded-full bg-[var(--brand-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand-strong)]">
                      {service.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function QuickLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)]"
    >
      <span className="h-4 w-4 text-[var(--brand-strong)] [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      {children}
    </Link>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
        <span className="h-4 w-4 text-[var(--brand-strong)] [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-400">{helper}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  pending,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  pending: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const classes = {
    primary: "bg-[var(--brand)] text-white hover:brightness-110",
    ghost: "border border-white/10 text-white hover:bg-white/[0.06]",
    danger: "border border-red-500/40 text-red-200 hover:bg-red-500/10",
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${classes[variant]}`}
    >
      {pending ? "Salvando..." : children}
    </button>
  );
}
