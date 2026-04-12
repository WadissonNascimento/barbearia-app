"use client";

import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { cancelCustomerAppointmentAction } from "./actions";

export default function CancelAppointmentButton({
  appointmentId,
  disabled = false,
}: {
  appointmentId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function cancelAppointment() {
    const formData = new FormData();
    formData.set("appointmentId", appointmentId);
    setMessage(null);

    startTransition(async () => {
      const result = await cancelCustomerAppointmentAction(formData);
      setMessage(result.message);

      if (result.ok) {
        setIsDialogOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled || isPending}
        className="inline-flex items-center gap-2 rounded-2xl border border-red-400/30 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <XCircle aria-hidden="true" className="h-4 w-4" />
        <span>{isPending ? "Cancelando..." : "Cancelar agendamento"}</span>
      </button>

      {message ? <p className="text-xs text-zinc-400">{message}</p> : null}

      {isMounted && isDialogOpen
        ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-appointment-title"
        >
          <div className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#080d18] p-5 text-white shadow-2xl shadow-black/60 sm:p-6">
            <div className="flex justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-200 ring-1 ring-red-300/20">
                <XCircle aria-hidden="true" className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-4 text-center">
              <h2
                id="cancel-appointment-title"
                className="text-xl font-semibold"
              >
                Cancelar agendamento?
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                Esse horario volta para a agenda e podera ser reservado por outro cliente.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={cancelAppointment}
                disabled={isPending}
                className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Cancelando..." : "Cancelar"}
              </button>
            </div>
          </div>
        </div>,
            document.body
          )
        : null}
    </div>
  );
}
