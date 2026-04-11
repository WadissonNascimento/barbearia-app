import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import { getBarberClientsDirectory } from "../data";
import ClientsDirectoryClient from "./ClientsDirectoryClient";

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

      <ClientsDirectoryClient clients={result.clients} search={result.search} />
    </div>
  );
}
