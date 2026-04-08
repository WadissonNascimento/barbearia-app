import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";

export default async function CustomerPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      customerId: session.user.id,
    },
    include: {
      barber: true,
      service: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Cliente</h1>
          <p className="text-zinc-400">Bem-vindo, {session.user.name}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="mb-8">
        <Link
          href="/agendar"
          className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          Novo agendamento
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Meus agendamentos</h2>

        {appointments.length === 0 ? (
          <p className="text-zinc-400">Você ainda não possui agendamentos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Barbeiro</th>
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
                      <td className="px-4 py-3">{appointment.service.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            appointment.status === "CONFIRMED"
                              ? "text-green-400"
                              : appointment.status === "CANCELLED"
                              ? "text-red-400"
                              : appointment.status === "DONE"
                              ? "text-blue-400"
                              : "text-yellow-400"
                          }
                        >
                          {appointment.status}
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