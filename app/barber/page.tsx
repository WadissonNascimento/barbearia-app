import {
  CalendarRange,
  Clock3,
  Scissors,
  Users,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import DashboardEntryCard from "@/components/ui/DashboardEntryCard";
import { LogoutButton } from "@/components/LogoutButton";
import { getBarberDashboardData } from "./data";
import { requireActiveBarber } from "./guard";

export default async function BarberPage() {
  const { session } = await requireActiveBarber();
  const dashboard = await getBarberDashboardData(session.user.id, {
    view: "today",
    status: "ALL",
  });

  const entries = [
    {
      href: "/barber/agenda",
      icon: CalendarRange,
      title: "Agenda",
      description: "Abra sua agenda completa, filtre atendimentos e atualize o andamento do dia.",
      badge: dashboard.summary.appointmentsToday
        ? `${dashboard.summary.appointmentsToday}`
        : undefined,
    },
    {
      href: "/barber/servicos",
      icon: Scissors,
      title: "Servicos",
      description: "Cadastre, edite, ative ou desative os servicos exclusivos do seu perfil.",
      badge: dashboard.services.length ? `${dashboard.services.length}` : undefined,
    },
    {
      href: "/barber/disponibilidade",
      icon: Clock3,
      title: "Disponibilidade",
      description: "Gerencie horarios da semana, bloqueios pontuais e bloqueios recorrentes.",
      badge:
        dashboard.blocks.length || dashboard.recurringBlocks.length
          ? `${dashboard.blocks.length + dashboard.recurringBlocks.length}`
          : undefined,
    },
    {
      href: "/barber/clientes",
      icon: Users,
      title: "Clientes",
      description: "Pesquise clientes, abra perfis e acompanhe observacoes do atendimento.",
      badge: dashboard.clients.length ? `${dashboard.clients.length}` : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2236_0%,#090b12_42%,#05060a_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <PageHeader
          eyebrow="Painel Barber"
          title="Area do barbeiro"
          description="Toque em uma opcao para abrir a pagina completa daquela funcao, sem modulos internos no celular."
          actions={
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-right">
                <p className="text-sm text-zinc-400">Logado como</p>
                <p className="font-medium text-white">{session.user.name || "Barbeiro"}</p>
              </div>
              <LogoutButton />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <DashboardEntryCard
              key={entry.href}
              href={entry.href}
              icon={entry.icon}
              title={entry.title}
              description={entry.description}
              badge={entry.badge}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
