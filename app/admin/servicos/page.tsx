import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createGlobalServiceAction,
  deleteGlobalServiceAction,
  toggleGlobalServiceAction,
  updateGlobalServiceAction,
} from "./actions";

export default async function AdminServicosPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  const services = await prisma.service.findMany({
    include: {
      barber: true,
    },
    orderBy: [{ barberId: "asc" }, { createdAt: "desc" }],
  });

  const globalServices = services.filter((service) => service.barberId === null);
  const barberServices = services.filter((service) => service.barberId !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Servicos e comissoes</h1>
          <p className="text-zinc-400">
            O admin controla os percentuais de repasse de todos os servicos, gerais e exclusivos.
          </p>
        </div>

        <Link
          href="/admin"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Voltar ao admin
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          action={createGlobalServiceAction}
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="text-xl font-semibold">Novo servico geral</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Esse servico podera ser usado em qualquer barbeiro no agendamento.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Nome">
              <input
                name="name"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </Field>

            <Field label="Descricao">
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preco">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  name="price"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
                />
              </Field>

              <Field label="Duracao (min)">
                <input
                  type="number"
                  min="10"
                  step="5"
                  name="duration"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>

            <Field label="Comissao do barbeiro (%)">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                name="commissionValue"
                defaultValue={40}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
              />
            </Field>

            <button
              type="submit"
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Criar servico geral
            </button>
          </div>
        </form>

        <div className="space-y-8">
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Servicos gerais</h2>
              <p className="text-sm text-zinc-400">
                Disponiveis para qualquer barbeiro, com repasse definido pelo admin.
              </p>
            </div>

            <div className="space-y-4">
              {globalServices.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-sm text-zinc-400">
                  Nenhum servico geral cadastrado.
                </div>
              ) : (
                globalServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              )}
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Servicos exclusivos dos barbeiros</h2>
              <p className="text-sm text-zinc-400">
                O barbeiro pode editar dados operacionais, mas a comissao continua sob controle do admin.
              </p>
            </div>

            <div className="space-y-4">
              {barberServices.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-900 p-6 text-sm text-zinc-400">
                  Nenhum servico exclusivo cadastrado.
                </div>
              ) : (
                barberServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
}: {
  service: Awaited<ReturnType<typeof prisma.service.findMany>>[number] & {
    barber: {
      id: string;
      name: string | null;
      email: string | null;
    } | null;
  };
}) {
  const ownerLabel = service.barber
    ? `Exclusivo de ${service.barber.name || service.barber.email || "Barbeiro"}`
    : "Servico geral";

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{service.name}</p>
          <p className="text-sm text-zinc-400">{ownerLabel}</p>
          <p className="text-xs text-zinc-500">
            {service.isActive ? "Ativo para agendamento" : "Desativado"} • Comissao:{" "}
            {service.commissionValue}%
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <form action={toggleGlobalServiceAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <button
              type="submit"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                service.isActive
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-green-600 text-white hover:bg-green-500"
              }`}
            >
              {service.isActive ? "Desativar" : "Ativar"}
            </button>
          </form>

          <form action={deleteGlobalServiceAction}>
            <input type="hidden" name="serviceId" value={service.id} />
            <button
              type="submit"
              className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Excluir
            </button>
          </form>
        </div>
      </div>

      <form action={updateGlobalServiceAction} className="grid gap-4">
        <input type="hidden" name="serviceId" value={service.id} />

        <Field label="Nome">
          <input
            name="name"
            defaultValue={service.name}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
          />
        </Field>

        <Field label="Descricao">
          <textarea
            name="description"
            defaultValue={service.description || ""}
            rows={3}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preco">
            <input
              type="number"
              step="0.01"
              min="1"
              name="price"
              defaultValue={service.price}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
            />
          </Field>

          <Field label="Duracao (min)">
            <input
              type="number"
              min="10"
              step="5"
              name="duration"
              defaultValue={service.duration}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
            />
          </Field>
        </div>

        <Field label="Comissao do barbeiro (%)">
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            name="commissionValue"
            defaultValue={service.commissionValue}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm outline-none"
          />
        </Field>

        <button
          type="submit"
          className="justify-self-start rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Salvar alteracoes
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
