import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FormFeedback from "@/components/FormFeedback";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { readPageFeedback } from "@/lib/pageFeedback";
import {
  createBarberAction,
  deleteBarberAction,
  toggleBarberStatusAction,
} from "./actions";

export default async function AdminBarbersPage({
  searchParams,
}: {
  searchParams?: { feedback?: string; tone?: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  const [barbers, pendingBarbers] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "BARBER",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        barberAppointments: true,
      },
    }),
    prisma.pendingRegistration.findMany({
      where: {
        role: "BARBER",
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const feedback = readPageFeedback(searchParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="CRUD de Barbeiros"
        description="Cadastre, acompanhe convites pendentes, desligue ou reative barbeiros sem perder historico."
        actions={
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao admin
          </Link>
        }
      />

      <FormFeedback
        success={feedback?.tone === "success" ? feedback.message : null}
        error={feedback?.tone === "error" ? feedback.message : null}
        info={feedback?.tone === "info" ? feedback.message : null}
      />

      <SectionCard
        title="Cadastrar novo barbeiro"
        description="O convite so vira conta ativa depois da confirmacao por e-mail."
        className="mt-6"
      >
        <form action={createBarberAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Nome</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">E-mail</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Senha inicial</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Telefone</label>
            <input
              name="phone"
              type="text"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Enviar convite do barbeiro
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Convites pendentes"
        description="Barbeiros que ainda precisam confirmar o e-mail para concluir a criacao."
        className="mt-8"
      >
        <div className="space-y-4">
          {pendingBarbers.length === 0 ? (
            <EmptyState
              title="Nenhum convite pendente"
              description="Quando voce enviar um novo convite, ele aparecera aqui ate a confirmacao."
            />
          ) : (
            pendingBarbers.map((barber) => (
              <div
                key={barber.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{barber.name}</h3>
                    <p className="text-sm text-zinc-400">{barber.email}</p>
                    <p className="text-sm text-zinc-400">
                      Telefone: {barber.phone || "Nao informado"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Expira em {new Date(barber.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <StatusBadge variant="warning">Pendente de confirmacao</StatusBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Barbeiros cadastrados"
        description="Gerencie os barbeiros ja confirmados. Ao desligar, o historico financeiro e os atendimentos permanecem salvos."
        className="mt-8"
      >
        <div className="space-y-4">
          {barbers.length === 0 ? (
            <EmptyState
              title="Nenhum barbeiro cadastrado"
              description="Depois que um convite for confirmado, o barbeiro aparecera aqui."
            />
          ) : (
            barbers.map((barber) => (
              <div
                key={barber.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{barber.name}</h3>
                    <p className="text-sm text-zinc-400">{barber.email}</p>
                    <p className="text-sm text-zinc-400">
                      Telefone: {barber.phone || "Nao informado"}
                    </p>
                    <p className="mt-2 text-sm">
                      Status:{" "}
                      <span
                        className={
                          barber.isActive ? "text-green-400" : "text-red-400"
                        }
                      >
                        {barber.isActive ? "Ativo" : "Desligado"}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-400">
                      Agendamentos vinculados: {barber.barberAppointments.length}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <form action={toggleBarberStatusAction}>
                      <input type="hidden" name="barberId" value={barber.id} />
                      <input
                        type="hidden"
                        name="currentActive"
                        value={String(barber.isActive)}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-yellow-600 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-600/10"
                      >
                        {barber.isActive ? "Inativar" : "Reativar"}
                      </button>
                    </form>

                    <form action={deleteBarberAction}>
                      <input type="hidden" name="barberId" value={barber.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-700/10"
                      >
                        Desligar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
