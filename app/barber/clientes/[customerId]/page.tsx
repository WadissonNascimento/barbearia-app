import Link from "next/link";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import {
  appointmentStatusColor,
  appointmentStatusLabel,
} from "@/lib/appointmentStatus";
import { getBarberClientProfile } from "../../data";
import { saveClientNoteAction } from "../../actions";

export default async function BarberClientProfilePage({
  params,
}: {
  params: { customerId: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/painel");
  }

  const profile = await getBarberClientProfile(session.user.id, params.customerId);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Perfil do cliente</h1>
          <p className="text-zinc-400">
            Historico completo deste cliente com voce.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/barber/clientes"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Buscar clientes
          </Link>
          <Link
            href="/barber"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao painel
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold">{profile.customer.name}</h2>
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">E-mail</p>
              <p className="mt-1 text-white">{profile.customer.email || "Nao informado"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Telefone</p>
              <p className="mt-1 text-white">{profile.customer.phone || "Nao informado"}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-zinc-400">Cliente desde</p>
              <p className="mt-1 text-white">
                {new Date(profile.customer.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <form action={saveClientNoteAction} className="mt-6">
            <input type="hidden" name="customerId" value={profile.customer.id} />
            <label className="block">
              <span className="mb-2 block text-sm text-zinc-300">Observacao interna</span>
              <textarea
                name="note"
                defaultValue={profile.customer.note}
                rows={5}
                placeholder="Preferencias, cuidados, observacoes importantes..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-3 rounded-xl bg-[#d4a15d] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Salvar observacao
            </button>
          </form>
        </section>

        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Atendimentos"
              value={profile.stats.totalAppointments}
            />
            <StatCard
              label="Concluidos"
              value={profile.stats.completedAppointments}
            />
            <StatCard
              label="Valor em servicos"
              value={`R$ ${profile.stats.totalSpent.toFixed(2)}`}
            />
            <StatCard
              label="Servico favorito"
              value={profile.stats.favoriteService || "-"}
            />
          </section>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Historico de atendimentos</h2>
              <p className="text-sm text-zinc-400">
                Lista completa dos servicos feitos com este cliente.
              </p>
            </div>

            <div className="space-y-4">
              {profile.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Data
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {new Date(appointment.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Hora
                      </p>
                      <p className="mt-2 text-sm text-white">
                        {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Servico
                      </p>
                      <p className="mt-2 text-sm text-white">{appointment.service.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Valor
                      </p>
                      <p className="mt-2 text-sm text-white">
                        R$ {appointment.service.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Status
                      </p>
                      <p className={`mt-2 text-sm font-semibold ${appointmentStatusColor(appointment.status)}`}>
                        {appointmentStatusLabel(appointment.status)}
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <p className="mt-3 text-sm text-zinc-400">
                      Obs: {appointment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
