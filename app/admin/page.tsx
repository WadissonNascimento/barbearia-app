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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Painel do Admin</h1>
          <p className="text-zinc-400">Bem-vindo, {session.user.name}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
        Aqui vai o dashboard do administrador.
      </div>
    </div>
  );
}