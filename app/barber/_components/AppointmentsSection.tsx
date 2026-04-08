import Link from "next/link";
import {
  appointmentStatusColor,
  appointmentStatusLabel,
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
  return (
    <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Agenda</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Veja apenas seus atendimentos e atualize o andamento do dia.
          </p>
        </div>

        <form className="grid gap-3 sm:grid-cols-3">
          <select
            name="view"
            defaultValue={filters.view}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="today">Hoje</option>
            <option value="upcoming">Proximos</option>
            <option value="all">Todos</option>
          </select>

          <select
            name="status"
            defaultValue={filters.status}
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
            defaultValue={filters.date}
            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
          />

          <button
            type="submit"
            className="rounded-xl bg-[#d4a15d] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 sm:col-span-3"
          >
            Atualizar filtros
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400">
            Nenhum agendamento encontrado com os filtros atuais.
          </div>
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
                      className="mt-2 block text-lg font-medium text-white transition hover:text-[#d4a15d]"
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
                    <p className="mt-2 text-white">{appointment.service.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {appointment.service.duration} min
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
                    <p className={`mt-2 text-sm font-semibold ${appointmentStatusColor(appointment.status)}`}>
                      {appointmentStatusLabel(appointment.status)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {appointment.notes || "Sem observacoes"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
                      href={`/barber/clientes/${appointment.customer.id}`}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d4a15d] hover:text-[#d4a15d]"
                    >
                      Ver perfil
                    </Link>
                    {appointment.status === "PENDING" && (
                      <>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CONFIRMED"
                          className="bg-green-600 text-white hover:bg-green-500"
                        >
                          Confirmar
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CANCELLED"
                          className="bg-red-600 text-white hover:bg-red-500"
                        >
                          Cancelar
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="NO_SHOW"
                          className="bg-orange-500 text-black hover:bg-orange-400"
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
                        >
                          Concluir
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="NO_SHOW"
                          className="bg-orange-500 text-black hover:bg-orange-400"
                        >
                          Nao veio
                        </StatusButton>
                        <StatusButton
                          appointmentId={appointment.id}
                          status="CANCELLED"
                          className="bg-red-600 text-white hover:bg-red-500"
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
    </section>
  );
}

function StatusButton({
  appointmentId,
  status,
  className,
  children,
}: {
  appointmentId: string;
  status: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <form action={updateAppointmentStatusAction}>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${className}`}
      >
        {children}
      </button>
    </form>
  );
}
