"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import BarberPhotoUploader from "@/components/BarberPhotoUploader";
import EmptyState from "@/components/ui/EmptyState";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  createBarberAction,
  deleteBarberAction,
  toggleBarberStatusAction,
  updateBarberPhotoAction,
} from "./actions";

type BarberItem = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  isActive: boolean;
  barberAppointments: Array<{ id: string }>;
};

type PendingBarberItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  expiresAt: Date;
};

export default function AdminBarbersClient({
  barbers,
  pendingBarbers,
  initialFeedback,
}: {
  barbers: BarberItem[];
  pendingBarbers: PendingBarberItem[];
  initialFeedback?: { message: string; tone: "success" | "error" | "info" } | null;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>(
    initialFeedback
      ? { message: initialFeedback.message, tone: initialFeedback.tone }
      : { message: null, tone: "success" }
  );
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
      <div className="mt-6 space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      <SectionCard
        title="Novo barbeiro"
        description="Envie o acesso inicial para ele entrar no painel."
        className="mt-6"
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;

            runAction("create-barber", createBarberAction, new FormData(form), () => form.reset());
          }}
        >
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
            <label className="mb-2 block text-sm text-zinc-300">Senha inicial</label>
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
              disabled={isPending && pendingKey === "create-barber"}
              className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && pendingKey === "create-barber"
                ? "Enviando..."
                : "Enviar acesso"}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        title="Convites pendentes"
        description="Acessos enviados que ainda nao foram confirmados."
        className="mt-8"
      >
        <div className="space-y-4">
          {pendingBarbers.length === 0 ? (
            <EmptyState
              title="Nenhum convite pendente"
              description="Quando voce enviar um novo convite, ele aparecera aqui ate a confirmacao."
            />
          ) : (
            pendingBarbers.map((barber) => (
              <div
                key={barber.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{barber.name}</h3>
                    <p className="text-sm text-zinc-400">{barber.email}</p>
                    <p className="text-sm text-zinc-400">
                      Telefone: {barber.phone || "Nao informado"}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Expira em {new Date(barber.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <StatusBadge variant="warning">Pendente de confirmacao</StatusBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Barbeiros da equipe"
        description="Ative, pause ou desligue barbeiros sem apagar historico."
        className="mt-8"
      >
        <div className="space-y-4">
          {barbers.length === 0 ? (
            <EmptyState
              title="Nenhum barbeiro cadastrado"
              description="Depois que um convite for confirmado, o barbeiro aparecera aqui."
            />
          ) : (
            barbers.map((barber) => (
              <div
                key={barber.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">{barber.name}</h3>
                      <p className="text-sm text-zinc-400">{barber.email}</p>
                      <p className="text-sm text-zinc-400">
                        Telefone: {barber.phone || "Nao informado"}
                      </p>
                      <p className="mt-2 text-sm">
                        Status:{" "}
                        <span className={barber.isActive ? "text-green-400" : "text-red-400"}>
                          {barber.isActive ? "Ativo" : "Desligado"}
                        </span>
                      </p>
                      <p className="text-sm text-zinc-400">
                        Agendamentos vinculados: {barber.barberAppointments.length}
                      </p>
                    </div>

                    <BarberPhotoUploader
                      action={updateBarberPhotoAction}
                      barberId={barber.id}
                      currentImage={barber.image}
                      name={barber.name || "Barbeiro"}
                      compact
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={isPending && pendingKey === `toggle-${barber.id}`}
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("barberId", barber.id);
                        formData.set("currentActive", String(barber.isActive));

                        runAction(
                          `toggle-${barber.id}`,
                          toggleBarberStatusAction,
                          formData
                        );
                      }}
                      className="rounded-xl border border-yellow-600 px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-600/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending && pendingKey === `toggle-${barber.id}`
                        ? "Salvando..."
                        : barber.isActive
                        ? "Inativar"
                        : "Reativar"}
                    </button>

                    <button
                      type="button"
                      disabled={isPending && pendingKey === `delete-${barber.id}`}
                      onClick={() => {
                        const formData = new FormData();
                        formData.set("barberId", barber.id);

                        runAction(`delete-${barber.id}`, deleteBarberAction, formData);
                      }}
                      className="rounded-xl border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending && pendingKey === `delete-${barber.id}`
                        ? "Desligando..."
                        : "Desligar"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </>
  );
}
