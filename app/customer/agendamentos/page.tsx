import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { getAppointmentDisplayName } from "@/lib/appointmentServices";
import {
  appointmentStatusLabel,
  appointmentStatusVariant,
} from "@/lib/appointmentStatus";

export default async function CustomerAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      customerId: session.user.id,
    },
    include: {
      barber: true,
      services: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      <PageHeader
        title="Meus agendamentos"
        description="Veja seus horarios e acompanhe o andamento de cada atendimento em uma pagina so."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/agendar"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Novo agendamento
            </Link>
            <Link
              href="/customer"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Voltar ao painel
            </Link>
          </div>
        }
      />

      <SectionCard
        title="Agenda do cliente"
        description="Cada card abaixo concentra data, hora, barbeiro, servicos e status."
      >
        {appointments.length === 0 ? (
          <EmptyState
            title="Nenhum agendamento por enquanto"
            description="Quando voce reservar seu primeiro horario, ele aparecera aqui."
            actionLabel="Agendar agora"
            actionHref="/agendar"
          />
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const date = new Date(appointment.date);

              return (
                <div
                  key={appointment.id}
                  className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                        Servicos
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {getAppointmentDisplayName(appointment.services)}
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        Com {appointment.barber.name || "Barbeiro"}
                      </p>
                    </div>

                    <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
                      {appointmentStatusLabel(appointment.status)}
                    </StatusBadge>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <InfoBlock
                      label="Data"
                      value={date.toLocaleDateString("pt-BR")}
                    />
                    <InfoBlock
                      label="Hora"
                      value={date.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    />
                    <InfoBlock
                      label="Observacoes"
                      value={appointment.notes || "Sem observacoes registradas"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}
