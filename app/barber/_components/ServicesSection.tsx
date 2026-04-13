"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import EmptyState from "@/components/ui/EmptyState";
import SectionCard from "@/components/ui/SectionCard";
import {
  createBarberServiceAction,
  deleteBarberServiceAction,
  toggleBarberServiceAction,
  updateBarberServiceAction,
} from "../actions";
import type { getBarberDashboardData } from "../data";

type BarberDashboardData = Awaited<ReturnType<typeof getBarberDashboardData>>;

export function ServicesSection({
  services,
}: {
  services: BarberDashboardData["services"];
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
    buildFormData: () => FormData,
    onDone?: () => void
  ) {
    setPendingKey(key);
    startTransition(async () => {
      const result = await action(buildFormData());
      setFeedback({ message: result.message, tone: result.tone });

      if (result.ok) {
        onDone?.();
        router.refresh();
      }

      setPendingKey(null);
    });
  }

  return (
    <SectionCard
      title="Servicos"
      description="Ajuste seus servicos proprios sem mexer nos servicos da barbearia."
      className="rounded-[28px] bg-zinc-900/90"
    >
      <div className="mt-6 space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form
          className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;

            runAction(
              "create-service",
              createBarberServiceAction,
              () => new FormData(form),
              () => form.reset()
            );
          }}
        >
          <h3 className="text-lg font-semibold text-white">Novo servico</h3>
          <div className="mt-4 space-y-4">
            <Field label="Nome">
              <input
                name="name"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>

            <Field label="Descricao">
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
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
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>

              <Field label="Duracao (min)">
                <input
                  type="number"
                  min="10"
                  step="5"
                  name="duration"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                />
              </Field>
            </div>

            <Field label="Intervalo depois do servico (min)">
              <input
                type="number"
                min="0"
                step="5"
                name="bufferAfter"
                defaultValue={0}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
              />
            </Field>

            <button
              type="submit"
              disabled={isPending && pendingKey === "create-service"}
              className="w-full rounded-xl bg-[var(--brand)] px-4 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && pendingKey === "create-service"
                ? "Criando..."
                : "Criar servico"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {services.length === 0 ? (
            <EmptyState
              title="Nenhum servico cadastrado"
              description="Crie seu primeiro servico para liberar novos agendamentos exclusivos."
            />
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{service.name}</p>
                    <p className="text-sm text-zinc-400">
                      {service.isActive ? "Ativo para agendamento" : "Indisponivel no momento"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {service.duration} min
                      {service.bufferAfter > 0 ? ` + ${service.bufferAfter} min de intervalo` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isPending && pendingKey === `toggle-${service.id}`}
                    onClick={() =>
                      runAction(`toggle-${service.id}`, toggleBarberServiceAction, () => {
                        const formData = new FormData();
                        formData.set("serviceId", service.id);
                        return formData;
                      })
                    }
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
                      if (
                        !window.confirm(
                          "Excluir servico? Se houver agendamentos no historico, ele sera apenas desativado."
                        )
                      ) {
                        return;
                      }

                      runAction(`delete-${service.id}`, deleteBarberServiceAction, () => {
                        const formData = new FormData();
                        formData.set("serviceId", service.id);
                        return formData;
                      });
                    }}
                    className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && pendingKey === `delete-${service.id}`
                      ? "Excluindo..."
                      : "Excluir"}
                  </button>
                </div>

                <form
                  className="grid gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = event.currentTarget;

                    runAction(
                      `update-${service.id}`,
                      updateBarberServiceAction,
                      () => new FormData(form)
                    );
                  }}
                >
                  <input type="hidden" name="serviceId" value={service.id} />

                  <Field label="Nome">
                    <input
                      name="name"
                      defaultValue={service.name}
                      required
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <Field label="Descricao">
                    <textarea
                      name="description"
                      defaultValue={service.description || ""}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
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
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
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
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
                      />
                    </Field>
                  </div>

                  <Field label="Intervalo depois do servico (min)">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      name="bufferAfter"
                      defaultValue={service.bufferAfter}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
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
            ))
          )}
        </div>
      </div>
    </SectionCard>
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
