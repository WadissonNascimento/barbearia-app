import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import { getBarberClientsDirectory } from "../data";

type SearchParams = {
  q?: string;
};

export default async function BarberClientsPage({
  searchParams,
}: {
  searchParams: SearchParams;
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

  const result = await getBarberClientsDirectory(
    session.user.id,
    searchParams.q || ""
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Clientes do barbeiro"
          description="Pesquise um cliente e abra o perfil completo dele."
          actions={
            <Link
              href="/barber"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Voltar ao painel
            </Link>
          }
        />
      </div>

      <SectionCard title="Busca de clientes" description="Encontre por nome, e-mail ou telefone.">
        <form>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={result.search}
            placeholder="Buscar por nome, email ou telefone"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#d4a15d] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Buscar
          </button>
        </div>
        </form>
      </SectionCard>

      <div className="mt-6 space-y-4">
        {result.clients.length === 0 ? (
          <EmptyState
            title="Nenhum cliente encontrado"
            description="Revise a busca ou aguarde novos atendimentos para ampliar sua base."
          />
        ) : (
          result.clients.map((client) => (
            <div
              key={client.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
                <div>
                  <p className="text-lg font-semibold text-white">{client.name}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {client.email || client.phone || "Sem contato"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Ultimo atendimento
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(client.lastAppointment).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Total de atendimentos
                  </p>
                  <p className="mt-2 text-sm text-white">{client.totalAppointments}</p>
                </div>
                <Link
                  href={`/barber/clientes/${client.id}`}
                  className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-[#d4a15d] hover:text-[#d4a15d]"
                >
                  Abrir perfil
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
