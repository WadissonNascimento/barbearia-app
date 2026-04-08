import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { MetricCard } from "./_components/MetricCard";
import { AppointmentsSection } from "./_components/AppointmentsSection";
import { ServicesSection } from "./_components/ServicesSection";
import { AvailabilitySection } from "./_components/AvailabilitySection";
import { ClientsSection } from "./_components/ClientsSection";
import { getBarberDashboardData } from "./data";

type SearchParams = {
  view?: "today" | "upcoming" | "all";
  status?: string;
  date?: string;
};

export default async function BarberPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/painel");
  }

  const dashboard = await getBarberDashboardData(session.user.id, searchParams);

  return (
    <div className="bg-[radial-gradient(circle_at_top,#1a2236_0%,#090b12_42%,#05060a_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 text-white">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-[#d4a15d]">
              Painel BARBER
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Rotina do barbeiro
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Gerencie apenas sua operacao: agenda, servicos, disponibilidade e clientes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-right">
              <p className="text-sm text-zinc-400">Logado como</p>
              <p className="font-medium text-white">{session.user.name || "Barbeiro"}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Agendamentos Hoje"
            value={dashboard.summary.appointmentsToday}
            helper="Quantidade total de horarios no dia atual."
          />
          <MetricCard
            label="Concluidos Hoje"
            value={dashboard.summary.completedToday}
            helper="Atendimentos finalizados com sucesso hoje."
          />
          <MetricCard
            label="Proximo Horario"
            value={
              dashboard.summary.nextAppointments[0]
                ? new Date(dashboard.summary.nextAppointments[0].date).toLocaleTimeString(
                    "pt-BR",
                    { hour: "2-digit", minute: "2-digit" }
                  )
                : "--:--"
            }
            helper={
              dashboard.summary.nextAppointments[0]
                ? dashboard.summary.nextAppointments[0].customer.name || "Cliente"
                : "Nenhum atendimento futuro confirmado."
            }
          />
        </div>

        <div className="mt-8 grid gap-8">
          <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Proximos agendamentos</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Um resumo rapido do que vem na sequencia do seu dia.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {dashboard.summary.nextAppointments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-400 lg:col-span-3">
                  Nao ha proximos agendamentos no momento.
                </div>
              ) : (
                dashboard.summary.nextAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                      {new Date(appointment.date).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-2 text-base text-white">
                      {appointment.customer.name || "Cliente"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">{appointment.service.name}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <AppointmentsSection
            appointments={dashboard.appointments}
            filters={dashboard.filters}
          />

          <ServicesSection services={dashboard.services} />

          <AvailabilitySection
            availabilities={dashboard.availabilities}
            blocks={dashboard.blocks}
          />

          <ClientsSection clients={dashboard.clients} />
        </div>
      </div>
    </div>
  );
}
