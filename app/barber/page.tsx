import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export default async function BarberPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/redirecionar");
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Painel do Barbeiro</h1>
            <p className="text-zinc-400">
              Bem-vindo, {session.user.name ?? session.user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Meus agendamentos</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Aqui vão apenas os horários do barbeiro logado.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Agenda do dia</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Aqui vai o resumo da agenda diária.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}