"use client";

import { useState } from "react";

const services = [
  "Corte",
  "Barba",
  "Sobrancelha",
  "Corte + Barba",
  "Pigmentação",
  "Hidratação"
];

const barbers = ["Wadisson", "Lucas", "Mateus"];
const times = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30"
];

export function AppointmentForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; whatsappUrl?: string } | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <form action={onSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg">
        <div className="grid gap-4 md:grid-cols-2">
          <input name="customer" placeholder="Seu nome" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required />
          <input name="phone" placeholder="WhatsApp" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required />
          <input name="email" type="email" placeholder="E-mail (opcional)" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" />
          <select name="service" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required>
            <option value="">Escolha o serviço</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
          <select name="barber" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required>
            <option value="">Escolha o barbeiro</option>
            {barbers.map((barber) => (
              <option key={barber} value={barber}>{barber}</option>
            ))}
          </select>
          <input name="date" type="date" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required />
          <select name="time" className="rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required>
            <option value="">Horário</option>
            {times.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <textarea name="notes" placeholder="Observações" className="mt-4 min-h-28 w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" />
        <button disabled={loading} className="mt-4 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:opacity-60">
          {loading ? "Agendando..." : "Confirmar agendamento"}
        </button>
      </form>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-xl font-semibold text-white">Como funciona</h3>
        <ol className="mt-4 space-y-3 text-zinc-300">
          <li>1. O cliente escolhe serviço, barbeiro, data e horário.</li>
          <li>2. O sistema salva o agendamento no banco.</li>
          <li>3. É criada uma mensagem pronta para o WhatsApp do barbeiro.</li>
          <li>4. O barbeiro visualiza o horário no painel.</li>
        </ol>

        {result && (
          <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-200">{result.message}</p>
            {result.whatsappUrl && (
              <a href={result.whatsappUrl} target="_blank" className="mt-3 inline-block rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black">
                Abrir WhatsApp do barbeiro
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
