"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  AppointmentMutationError,
  createCustomerAppointment,
} from "@/lib/appointmentMutations";
import type { FormFeedbackState } from "@/lib/formFeedbackState";

export async function createAppointmentAction(
  _prevState: FormFeedbackState,
  formData: FormData
): Promise<FormFeedbackState> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const barberId = String(formData.get("barberId") || "");
  const serviceIds = String(formData.get("serviceIds") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!barberId || serviceIds.length === 0 || !date || !time) {
    return {
      error: "Selecione barbeiro, servicos, data e horario para continuar.",
      success: null,
    };
  }

  try {
    await createCustomerAppointment({
      customerId: session.user.id,
      barberId,
      serviceIds,
      date,
      time,
      notes,
    });
  } catch (error) {
    if (error instanceof AppointmentMutationError) {
      return {
        error: error.message,
        success: null,
      };
    }

    throw error;
  }

  revalidatePath("/customer");
  revalidatePath("/customer/agendamentos");
  revalidatePath("/barber");
  revalidatePath("/admin/agenda");
  revalidatePath("/agendar");

  redirect("/customer/agendamentos");
}
