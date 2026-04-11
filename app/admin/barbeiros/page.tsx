import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import { readPageFeedback } from "@/lib/pageFeedback";
import AdminBarbersClient from "./AdminBarbersClient";

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

      <AdminBarbersClient
        barbers={barbers}
        pendingBarbers={pendingBarbers}
        initialFeedback={feedback}
      />
    </div>
  );
}
