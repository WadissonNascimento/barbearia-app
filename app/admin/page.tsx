import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Admin</h1>
          <p className="text-zinc-400">Bem-vindo, {session.user.name}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/barbeiros"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
        >
          <h2 className="text-xl font-semibold">CRUD de Barbeiros</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Cadastrar, inativar, reativar e excluir barbeiros.
          </p>
        </Link>

        <Link
          href="/admin/agenda"
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
        >
          <h2 className="text-xl font-semibold">Agenda Geral</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Visualize todos os agendamentos e filtre por barbeiro e período.
          </p>
        </Link>
      </div>
    </div>
  );
}