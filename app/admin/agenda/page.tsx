import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  appointmentStatusColor,
  appointmentStatusLabel,
} from "@/lib/appointmentStatus";

type SearchParams = {
  barberId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
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
      name: "asc",
    },
  });

  const barberId = searchParams.barberId || "";
  const dateFrom = searchParams.dateFrom || "";
  const dateTo = searchParams.dateTo || "";

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(barberId ? { barberId } : {}),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00`) } : {}),
              ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59`) } : {}),
            },
          }
        : {}),
    },
    include: {
      barber: true,
      customer: true,
      service: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agenda Geral</h1>
          <p className="text-zinc-400">
            Visualize todos os agendamentos dos barbeiros.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Voltar ao admin
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Filtros</h2>

        <form className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Barbeiro</label>
            <select
              name="barberId"
              defaultValue={barberId}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
              <option value="">Todos</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">De</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Até</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Filtrar
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Agendamentos</h2>

        {appointments.length === 0 ? (
          <p className="text-zinc-400">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Observações</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => {
                  const date = new Date(appointment.date);

                  return (
                    <tr
                      key={appointment.id}
                      className="border-b border-zinc-800 text-sm"
                    >
                      <td className="px-4 py-3">
                        {date.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        {date.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">{appointment.barber.name}</td>
                      <td className="px-4 py-3">{appointment.customer.name}</td>
                      <td className="px-4 py-3">{appointment.service.name}</td>
                      <td className="px-4 py-3">
                        <span className={appointmentStatusColor(appointment.status)}>
                          {appointmentStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {appointment.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
