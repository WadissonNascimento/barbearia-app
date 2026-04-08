import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createBarberAction,
  deleteBarberAction,
  toggleBarberStatusAction,
} from "./actions";

export default async function AdminBarbersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  const barbers = await prisma.user.findMany({
    where: {
      role: "BARBER",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      barberAppointments: true,
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRUD de Barbeiros</h1>
          <p className="text-zinc-400">
            Cadastre, inative, reative ou exclua barbeiros.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Voltar ao admin
        </Link>
      </div>

      <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Cadastrar novo barbeiro</h2>

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
            <label className="mb-2 block text-sm text-zinc-300">Senha</label>
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
              Cadastrar barbeiro
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Barbeiros cadastrados</h2>

        <div className="space-y-4">
          {barbers.length === 0 ? (
            <p className="text-zinc-400">Nenhum barbeiro cadastrado ainda.</p>
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
                      Telefone: {barber.phone || "Não informado"}
                    </p>
                    <p className="mt-2 text-sm">
                      Status:{" "}
                      <span
                        className={
                          barber.isActive ? "text-green-400" : "text-red-400"
                        }
                      >
                        {barber.isActive ? "Ativo" : "Inativo"}
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
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
