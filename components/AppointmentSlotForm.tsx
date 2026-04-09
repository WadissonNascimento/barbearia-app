"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createAppointmentAction } from "@/app/agendar/actions";
import FeedbackMessage from "@/components/FeedbackMessage";
import { initialFormFeedbackState } from "@/lib/formFeedbackState";

function SlotButton({ slot }: { slot: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="time"
      value={slot}
      disabled={pending}
      className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm transition hover:border-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Reservando..." : slot}
    </button>
  );
}

export default function AppointmentSlotForm({
  barberId,
  serviceIds,
  date,
  slots,
}: {
  barberId: string;
  serviceIds: string[];
  date: string;
  slots: string[];
}) {
  const [state, formAction] = useFormState(
    createAppointmentAction,
    initialFormFeedbackState
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="barberId" value={barberId} />
      <input type="hidden" name="serviceIds" value={serviceIds.join(",")} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="notes" value="" />

      <div className="flex flex-wrap gap-3">
        {slots.map((slot) => (
          <SlotButton key={slot} slot={slot} />
        ))}
      </div>

      <div className="mt-4">
        <FeedbackMessage message={state.error} tone="error" />
      </div>
    </form>
  );
}
