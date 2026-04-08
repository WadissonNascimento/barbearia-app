import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { updateCustomerProfileAction } from "./actions";
import {
  appointmentStatusColor,
  appointmentStatusLabel,
} from "@/lib/appointmentStatus";

export default async function MeuPerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const [customer, appointments, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
    prisma.appointment.findMany({
      where: {
        customerId: session.user.id,
      },
      include: {
        barber: true,
        service: true,
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
  ]);

  const totalSpentOnServices = appointments.reduce(
    (sum, appointment) => sum + appointment.service.price,
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Meu perfil</h1>
          <p className="text-zinc-400">
            Veja seus dados, historico de servicos e pedidos recentes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/customer"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao painel
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">Informacoes pessoais</h2>

          <form action={updateCustomerProfileAction} className="mt-5 space-y-4">
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
          </div>
        </section>

        <div className="space-y-8">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Historico de servicos</h2>
                <p className="text-sm text-zinc-400">
                  Tudo o que voce ja agendou com os barbeiros.
                </p>
              </div>

              <Link
                href="/agendar"
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Novo agendamento
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {appointments.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Voce ainda nao tem historico de servicos.
                </p>
              ) : (
                appointments.map((appointment) => (
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
                          Barbeiro
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {appointment.barber.name || "Barbeiro"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Servico
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {appointment.service.name}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400">
                          R$ {appointment.service.price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          Status
                        </p>
                        <p className={`mt-2 text-sm font-semibold ${appointmentStatusColor(appointment.status)}`}>
                          {appointmentStatusLabel(appointment.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Pedidos recentes</h2>
                <p className="text-sm text-zinc-400">
                  Seus ultimos pedidos da loja em um resumo rapido.
                </p>
              </div>

              <Link
                href="/meus-pedidos"
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {orders.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum pedido encontrado.</p>
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
          </section>
        </div>
      </div>
    </div>
  );
}
