import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import FormFeedback from "@/components/FormFeedback";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  getAppointmentDisplayName,
  getAppointmentTotalPrice,
} from "@/lib/appointmentServices";
import { readPageFeedback } from "@/lib/pageFeedback";
import { updateCustomerProfileAction } from "./actions";
import {
  appointmentStatusLabel,
  appointmentStatusVariant,
} from "@/lib/appointmentStatus";

function toDateInput(value?: Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function MeuPerfilPage({
  searchParams,
}: {
  searchParams?: { feedback?: string; tone?: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const [customer, appointments, orders, barbers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProfile: {
          include: {
            preferredBarber: true,
          },
        },
      },
    }),
    prisma.appointment.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        barber: true,
        services: true,
      },
      orderBy: {
        date: "desc",
      },
    }),
    prisma.order.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        role: "BARBER",
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const totalSpentOnServices = appointments.reduce(
    (sum, appointment) => sum + getAppointmentTotalPrice(appointment.services),
    0
  );
  const favoriteServiceMap = new Map<string, number>();

  for (const appointment of appointments) {
    favoriteServiceMap.set(
      getAppointmentDisplayName(appointment.services),
      (favoriteServiceMap.get(getAppointmentDisplayName(appointment.services)) || 0) + 1
    );
  }

  const favoriteService = Array.from(favoriteServiceMap.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || null;
  const feedback = readPageFeedback(searchParams);
  const profile = customer?.customerProfile;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="Meu perfil"
        description="Veja seus dados, preferencias, historico de servicos e pedidos recentes."
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/customer"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Voltar ao painel
            </Link>
            <LogoutButton />
          </div>
        }
      />

      <FormFeedback
        success={feedback?.tone === "success" ? feedback.message : null}
        error={feedback?.tone === "error" ? feedback.message : null}
        info={feedback?.tone === "info" ? feedback.message : null}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Informacoes pessoais</h2>

          <form action={updateCustomerProfileAction} className="mt-5 space-y-4">
            <input type="hidden" name="redirectTo" value="/meu-perfil" />

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Nome</span>
              <input
                name="name"
                defaultValue={customer?.name || ""}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">E-mail</span>
              <input
                value={customer?.email || ""}
                readOnly
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Telefone</span>
              <input
                name="phone"
                defaultValue={customer?.phone || ""}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Data de nascimento</span>
              <input
                type="date"
                name="birthDate"
                defaultValue={toDateInput(profile?.birthDate)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Barbeiro preferido</span>
              <select
                name="preferredBarberId"
                defaultValue={profile?.preferredBarberId || ""}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              >
                <option value="">Sem preferencia</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Alergias ou cuidados</span>
              <textarea
                name="allergies"
                rows={3}
                defaultValue={profile?.allergies || ""}
                placeholder="Ex.: sensibilidade a determinados produtos"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Preferencias</span>
              <textarea
                name="preferences"
                rows={3}
                defaultValue={profile?.preferences || ""}
                placeholder="Ex.: estilo de corte, acabamento, horario favorito"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Salvar perfil
            </button>
          </form>

          <div className="mt-6 grid gap-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Total de atendimentos</p>
              <p className="mt-1 text-2xl font-semibold">{appointments.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Valor total em servicos</p>
              <p className="mt-1 text-2xl font-semibold">
                R$ {totalSpentOnServices.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Servico favorito</p>
              <p className="mt-1 text-lg font-semibold">
                {favoriteService || "Ainda indefinido"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Barbeiro preferido</p>
              <p className="mt-1 text-lg font-semibold">
                {profile?.preferredBarber?.name || "Nao informado"}
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <SectionCard
            title="Resumo do perfil"
            description="Informacoes que ajudam a personalizar melhor seus proximos atendimentos."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Data de nascimento
                </p>
                <p className="mt-2 text-sm text-white">
                  {profile?.birthDate
                    ? new Date(profile.birthDate).toLocaleDateString("pt-BR")
                    : "Nao informada"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Alergias ou cuidados
                </p>
                <p className="mt-2 text-sm text-white">
                  {profile?.allergies || "Nenhuma observacao registrada"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Preferencias
                </p>
                <p className="mt-2 text-sm text-white">
                  {profile?.preferences || "Nenhuma preferencia registrada"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Historico de servicos"
            description="Linha do tempo dos seus ultimos atendimentos."
            actions={
              <Link
                href="/agendar"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Novo agendamento
              </Link>
            }
          >
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <EmptyState
                  title="Sem historico de servicos"
                  description="Seus atendimentos vao aparecer aqui com status, barbeiro e valor."
                  actionLabel="Agendar atendimento"
                  actionHref="/agendar"
                />
              ) : (
                appointments.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className={`rounded-2xl border p-4 ${
                      index === 0
                        ? "border-sky-500/30 bg-sky-500/10"
                        : "border-zinc-800 bg-zinc-950/70"
                    }`}
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {index === 0 ? "Ultimo atendimento" : "Atendimento"}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {getAppointmentDisplayName(appointment.services)}
                        </p>
                      </div>
                      <StatusBadge variant={appointmentStatusVariant(appointment.status)}>
                        {appointmentStatusLabel(appointment.status)}
                      </StatusBadge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-4">
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
                          Barbeiro
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {appointment.barber.name || "Barbeiro"}
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
                    </div>

                    {appointment.notes && (
                      <p className="mt-3 text-sm text-zinc-300">
                        Observacoes: {appointment.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Pedidos recentes"
            description="Seus ultimos pedidos da loja em um resumo rapido."
            actions={
              <Link
                href="/meus-pedidos"
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Ver todos
              </Link>
            }
          >
            <div className="space-y-4">
              {orders.length === 0 ? (
                <EmptyState
                  title="Nenhum pedido encontrado"
                  description="Seus pedidos da loja aparecerao aqui assim que voce concluir uma compra."
                  actionLabel="Ver produtos"
                  actionHref="/produtos"
                />
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <p className="text-sm text-zinc-400">
                      Pedido em {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="mt-1 text-sm text-white">
                      Total: R$ {order.total.toFixed(2)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {order.items.map((item) => `${item.product.name} x${item.quantity}`).join(", ")}
                    </p>
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
