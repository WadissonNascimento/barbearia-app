import Link from "next/link";

const services = [
  { name: "Corte", price: "R$ 35" },
  { name: "Barba", price: "R$ 25" },
  { name: "Sobrancelha", price: "R$ 15" },
  { name: "Corte + Barba", price: "R$ 55" }
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
        <div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            Sistema completo para barbearia
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Agendamento online, WhatsApp e vendas no mesmo site.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-zinc-300">
            O cliente agenda o horário, o barbeiro recebe a mensagem no WhatsApp e ainda vende produtos com pagamento via Mercado Pago.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/agendar" className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black">Agendar agora</Link>
            <Link href="/produtos" className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white">Ver produtos</Link>
          </div>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Agendamentos hoje</p>
              <p className="mt-2 text-3xl font-bold text-white">12</p>
            </div>
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-sm text-zinc-400">Produtos vendidos</p>
              <p className="mt-2 text-3xl font-bold text-white">27</p>
            </div>
            <div className="rounded-2xl bg-zinc-900 p-5 sm:col-span-2">
              <p className="text-sm text-zinc-400">Fluxo do projeto</p>
              <p className="mt-2 text-zinc-200">Cliente agenda → sistema salva → WhatsApp do barbeiro → barbeiro vê no painel → cliente compra produtos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h2 className="text-3xl font-bold text-white">Serviços</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.name} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-lg font-semibold text-white">{service.name}</h3>
              <p className="mt-2 text-zinc-400">Preço inicial</p>
              <p className="mt-1 font-bold text-emerald-400">{service.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
