import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FormFeedback from "@/components/FormFeedback";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  getAppointmentDisplayName,
  getAppointmentTotalPrice,
} from "@/lib/appointmentServices";
import {
  appointmentStatusLabel,
  appointmentStatusVariant,
} from "@/lib/appointmentStatus";
import { readPageFeedback } from "@/lib/pageFeedback";
import { getBarberClientProfile } from "../../data";
import { saveClientNoteAction } from "../../actions";

export default async function BarberClientProfilePage({
  params,
  searchParams,
}: {
  params: { customerId: string };
  searchParams?: { feedback?: string; tone?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/painel");
  }

  const activeBarber = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "BARBER",
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!activeBarber) {
    redirect("/login");
  }

  const profile = await getBarberClientProfile(session.user.id, params.customerId);
  const feedback = readPageFeedback(searchParams);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="Perfil do cliente"
        description="Historico completo deste cliente com voce."
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/barber/clientes"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Buscar clientes
            </Link>
            <Link
              href="/barber"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Voltar ao painel
            </Link>
          </div>
        }
      />

      <FormFeedback
        success={feedback?.tone === "success" ? feedback.message : null}
        error={feedback?.tone === "error" ? feedback.message : null}
        info={feedback?.tone === "info" ? feedback.message : null}
      />

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">{profile.customer.name}</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">E-mail</p>
              <p className="mt-1 text-white">{profile.customer.email || "Nao informado"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Telefone</p>
              <p className="mt-1 text-white">{profile.customer.phone || "Nao informado"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Cliente desde</p>
              <p className="mt-1 text-white">
                {new Date(profile.customer.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Nascimento</p>
              <p className="mt-1 text-white">
                {profile.customer.birthDate
                  ? new Date(profile.customer.birthDate).toLocaleDateString("pt-BR")
                  : "Nao informado"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Barbeiro preferido</p>
              <p className="mt-1 text-white">
                {profile.customer.preferredBarberName || "Sem preferencia definida"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Alergias ou cuidados</p>
              <p className="mt-1 text-white">
                {profile.customer.allergies || "Nenhuma observacao registrada"}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Preferencias</p>
              <p className="mt-1 text-white">
                {profile.customer.preferences || "Nenhuma preferencia registrada"}
              </p>
            </div>
          </div>

          <form action={saveClientNoteAction} className="mt-6">
            <input
              type="hidden"
              name="redirectTo"
              value={`/barber/clientes/${profile.customer.id}`}
            />
            <input type="hidden" name="customerId" value={profile.customer.id} />
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Observacao interna</span>
              <textarea
                name="note"
                defaultValue={profile.customer.note}
                rows={5}
                placeholder="Preferencias, cuidados, observacoes importantes..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-3 rounded-xl bg-[#d4a15d] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Salvar observacao
            </button>
          </form>
        </section>

        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Atendimentos"
              value={profile.stats.totalAppointments}
            />
            <StatCard
              label="Concluidos"
              value={profile.stats.completedAppointments}
            />
            <StatCard
              label="Valor em servicos"
              value={`R$ ${profile.stats.totalSpent.toFixed(2)}`}
            />
            <StatCard
              label="Servico favorito"
              value={profile.stats.favoriteService || "-"}
            />
          </section>

          <SectionCard
            title="Historico de atendimentos"
            description="Lista completa dos servicos feitos com este cliente."
          >
            <div className="space-y-4">
              {profile.appointments.length === 0 ? (
                <EmptyState
                  title="Sem atendimentos registrados"
                  description="Assim que esse cliente concluir atendimentos, o historico aparecera aqui."
                />
              ) : (
                profile.appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div className="grid gap-3 md:grid-cols-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Data
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {new Date(appointment.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Hora
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Servico
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {getAppointmentDisplayName(appointment.services)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Valor
                        </p>
                        <p className="mt-2 text-sm text-white">
                          R$ {getAppointmentTotalPrice(appointment.services).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Status
                        </p>
                        <div className="mt-2">
                          <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
                            {appointmentStatusLabel(appointment.status)}
                          </StatusBadge>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="mt-3 text-sm text-zinc-400">
                        Obs: {appointment.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
