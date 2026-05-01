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
        title="Cadastrar novo barbeiro"
        className="mt-6 overflow-hidden rounded-[30px] border border-sky-500/20 bg-[linear-gradient(180deg,rgba(16,26,46,0.96),rgba(10,15,28,0.98))] shadow-[0_24px_80px_rgba(2,132,199,0.14)]"
      >
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;

            runAction("create-barber", createBarberAction, new FormData(form), () => form.reset());
          }}
        >
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              Nome
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/40 focus:bg-zinc-950"
              placeholder="Ex.: Lucas Barber"
            />
          </div>

          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/40 focus:bg-zinc-950"
              placeholder="barbeiro@jakbarber.com"
            />
          </div>

          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              Senha inicial
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/40 focus:bg-zinc-950"
              placeholder="Minimo de 6 caracteres"
            />
          </div>

          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              Telefone
            </label>
            <input
              name="phone"
              type="text"
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/40 focus:bg-zinc-950"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending && pendingKey === "create-barber"}
              className="w-full rounded-2xl bg-[var(--brand)] px-5 py-3.5 font-semibold text-white shadow-[0_18px_40px_rgba(14,165,233,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
        className="mt-8 overflow-hidden rounded-[30px] border border-sky-500/15 bg-[linear-gradient(180deg,rgba(15,22,36,0.98),rgba(9,12,20,0.98))] shadow-[0_24px_80px_rgba(2,132,199,0.08)]"
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
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(32,43,64,0.52),rgba(18,24,39,0.90))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-white">{barber.name}</h3>
                    <StatusBadge variant="warning">Pendente de confirmacao</StatusBadge>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        E-mail
                      </p>
                      <p className="mt-2 break-all text-sm text-zinc-300">{barber.email}</p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Telefone
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        {barber.phone || "Nao informado"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      Expira em
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {new Date(barber.expiresAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Equipe atual de Barbeiros"
        description="Ative, pause ou desligue barbeiros sem apagar historico, mantendo a operacao alinhada com o restante do painel."
        className="mt-8 overflow-hidden rounded-[30px] border border-sky-500/15 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(9,12,20,0.98))] shadow-[0_24px_80px_rgba(2,132,199,0.10)]"
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
                className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,51,78,0.62),rgba(17,24,39,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] sm:p-5"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-sky-300">
                      Barbeiro ativo no sistema
                    </div>
                    <div
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
                        barber.isActive
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/20 bg-red-500/10 text-red-200"
                      }`}
                    >
                      {barber.isActive ? "Ativo" : "Desligado"}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-[1.7rem] font-semibold leading-none text-white">
                      {barber.name}
                    </h3>
                    <p className="break-all text-sm text-zinc-300">{barber.email}</p>
                    <p className="text-sm text-zinc-400">
                      Telefone: {barber.phone || "Nao informado"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Status
                      </p>
                      <p
                        className={`mt-2 text-base font-semibold ${
                          barber.isActive ? "text-emerald-300" : "text-red-200"
                        }`}
                      >
                        {barber.isActive ? "Ativo" : "Desligado"}
                      </p>
                    </div>
                    <div className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Agendamentos
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {barber.barberAppointments.length}
                      </p>
                    </div>
                  </div>

                  <BarberPhotoUploader
                    action={updateBarberPhotoAction}
                    barberId={barber.id}
                    currentImage={barber.image}
                    name={barber.name || "Barbeiro"}
                    compact
                  />

                  <div className="grid grid-cols-2 gap-3">
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
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        barber.isActive
                          ? "border border-white/10 bg-white/[0.04] text-white hover:border-[var(--brand)]/35 hover:bg-[var(--brand-muted)]"
                          : "border border-emerald-500/30 bg-emerald-500/8 text-emerald-200 hover:bg-emerald-500/14"
                      }`}
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
                        if (
                          !window.confirm(
                            "Desligar barbeiro? A conta perde acesso, mas historico e agendamentos serao preservados."
                          )
                        ) {
                          return;
                        }

                        const formData = new FormData();
                        formData.set("barberId", barber.id);

                        runAction(`delete-${barber.id}`, deleteBarberAction, formData);
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
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
