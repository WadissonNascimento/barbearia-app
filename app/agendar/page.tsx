import { AppointmentForm } from "@/components/AppointmentForm";

export default function AgendarPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-bold text-white">Agendar horário</h1>
      <p className="mt-3 max-w-2xl text-zinc-300">
        Escolha o serviço, o barbeiro e o horário. O sistema cadastra o agendamento e gera a mensagem para WhatsApp.
      </p>
      <div className="mt-8">
        <AppointmentForm />
      </div>
    </section>
  );
}
