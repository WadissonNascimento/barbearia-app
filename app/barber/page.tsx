import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/LogoutButton";
import { updateAppointmentStatusAction } from "./actions";

export default async function BarberPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/painel");
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      barberId: session.user.id,
    },
    include: {
      customer: true,
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
          <h1 className="text-3xl font-bold">Painel do Barbeiro</h1>
          <p className="text-zinc-400">Bem-vindo, {session.user.name}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Minha agenda</h2>

        {appointments.length === 0 ? (
          <p className="text-zinc-400">Nenhum agendamento encontrado.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const date = new Date(appointment.date);

              return (
                <div
                  key={appointment.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                >
                  <div className="grid gap-2 text-sm md:grid-cols-6">
                    <div>
                      <p className="text-zinc-400">Data</p>
                      <p>{date.toLocaleDateString("pt-BR")}</p>
                    </div>

                    <div>
                      <p className="text-zinc-400">Hora</p>
                      <p>
                        {date.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-400">Cliente</p>
                      <p>{appointment.customer.name}</p>
                    </div>

                    <div>
                      <p className="text-zinc-400">Servico</p>
                      <p>{appointment.service.name}</p>
                    </div>

                    <div>
                      <p className="text-zinc-400">Status</p>
                      <p
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
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-400">Obs</p>
                      <p>{appointment.notes || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {appointment.status === "PENDING" && (
                      <>
                        <form action={updateAppointmentStatusAction}>
                          <input
                            type="hidden"
                            name="appointmentId"
                            value={appointment.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="CONFIRMED"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold hover:bg-green-500"
                          >
                            Confirmar
                          </button>
                        </form>

                        <form action={updateAppointmentStatusAction}>
                          <input
                            type="hidden"
                            name="appointmentId"
                            value={appointment.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value="CANCELLED"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500"
                          >
                            Cancelar
                          </button>
                        </form>
                      </>
                    )}

                    {appointment.status === "CONFIRMED" && (
                      <form action={updateAppointmentStatusAction}>
                        <input
                          type="hidden"
                          name="appointmentId"
                          value={appointment.id}
                        />
                        <input type="hidden" name="status" value="DONE" />
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
                        >
                          Marcar como concluido
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
