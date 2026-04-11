"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import {
  createGlobalServiceAction,
  deleteGlobalServiceAction,
  toggleGlobalServiceAction,
  updateGlobalServiceAction,
} from "./actions";

type ServiceItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  commissionValue: number;
  isActive: boolean;
  barber: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

export default function AdminServicesClient({
  globalServices,
  barberServices,
}: {
  globalServices: ServiceItem[];
  barberServices: ServiceItem[];
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    key: string,
    action: (formData: FormData) => Promise<{
      ok: boolean;
      message: string;
      tone: "success" | "error" | "info";
    }>,
    formData: FormData,
    onSuccess?: () => void
  ) {
    setPendingKey(key);

    startTransition(async () => {
      const result = await action(formData);
      setFeedback({ message: result.message, tone: result.tone });

      if (result.ok) {
        onSuccess?.();
        router.refresh();
      }

      setPendingKey(null);
    });
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;

            runAction(
              "create-service",
              createGlobalServiceAction,
              new FormData(form),
              () => form.reset()
            );
          }}
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
              disabled={isPending && pendingKey === "create-service"}
              className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && pendingKey === "create-service"
                ? "Criando..."
                : "Criar servico geral"}
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
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isPending={isPending}
                    pendingKey={pendingKey}
                    onRunAction={runAction}
                  />
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
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isPending={isPending}
                    pendingKey={pendingKey}
                    onRunAction={runAction}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function ServiceCard({
  service,
  isPending,
  pendingKey,
  onRunAction,
}: {
  service: ServiceItem;
  isPending: boolean;
  pendingKey: string | null;
  onRunAction: (
    key: string,
    action: (formData: FormData) => Promise<{
      ok: boolean;
      message: string;
      tone: "success" | "error" | "info";
    }>,
    formData: FormData
  ) => void;
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
            {service.isActive ? "Ativo para agendamento" : "Desativado"} - Comissao:{" "}
            {service.commissionValue}%
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending && pendingKey === `toggle-${service.id}`}
            onClick={() => {
              const formData = new FormData();
              formData.set("serviceId", service.id);
              onRunAction(`toggle-${service.id}`, toggleGlobalServiceAction, formData);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              service.isActive
                ? "bg-zinc-800 text-white hover:bg-zinc-700"
                : "bg-green-600 text-white hover:bg-green-500"
            }`}
          >
            {isPending && pendingKey === `toggle-${service.id}`
              ? "Salvando..."
              : service.isActive
              ? "Desativar"
              : "Ativar"}
          </button>

          <button
            type="button"
            disabled={isPending && pendingKey === `delete-${service.id}`}
            onClick={() => {
              const formData = new FormData();
              formData.set("serviceId", service.id);
              onRunAction(`delete-${service.id}`, deleteGlobalServiceAction, formData);
            }}
            className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && pendingKey === `delete-${service.id}` ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>

      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onRunAction(`update-${service.id}`, updateGlobalServiceAction, formData);
        }}
      >
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
          disabled={isPending && pendingKey === `update-${service.id}`}
          className="justify-self-start rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && pendingKey === `update-${service.id}`
            ? "Salvando..."
            : "Salvar alteracoes"}
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
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
