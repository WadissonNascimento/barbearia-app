import Link from "next/link";

const services = [
  {
    name: "Corte masculino",
    description: "Acabamento limpo, estilo atual e atenção aos detalhes.",
    price: "A partir de R$ 35",
  },
  {
    name: "Barba",
    description: "Desenho, alinhamento e finalização para valorizar o visual.",
    price: "A partir de R$ 25",
  },
  {
    name: "Corte + barba",
    description: "Combo completo para sair na régua.",
    price: "A partir de R$ 55",
  },
  {
    name: "Corte infantil",
    description: "Atendimento cuidadoso para os pequenos, sem perder o estilo.",
    price: "Consulte valores",
  },
];

const highlights = [
  "Especialista em cortes masculinos",
  "Atendimento de terça a domingo",
  "Agende sua experiência online",
  "Produtos e pagamentos no mesmo site",
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
        <div>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            JakCompany • Osasco, SP
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">
            Seu estilo em dia com corte, barba e atendimento de verdade.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-zinc-300">
            Na JakCompany, você agenda seu horário online, garante praticidade no
            atendimento e ainda encontra produtos para manter o visual em casa.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/agendar"
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              Agendar experiência
            </Link>

            <Link
              href="/produtos"
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Ver produtos
            </Link>
          </div>


        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              JakCompany
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Agende sua experiência
            </h2>

            <p className="mt-3 text-zinc-400">
              Corte, barba e atendimento pensado para quem quer sair na régua.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
                📍 Osasco, SP
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
                🗓️ Funcionamento de terça a domingo
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-300">
                💬 Confirmação e contato pelo WhatsApp
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
              Serviços
            </p>
            <h2 className="text-3xl font-bold text-white">
              O que você encontra na JakCompany
            </h2>
          </div>

          <p className="max-w-xl text-zinc-400">
            Cortes modernos, barba bem desenhada e atendimento com foco em
            experiência e acabamento.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:-translate-y-1 hover:border-emerald-500/40"
            >
              <h3 className="text-lg font-semibold text-white">
                {service.name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {service.description}
              </p>
              <p className="mt-5 font-bold text-emerald-400">{service.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 px-6 py-8 md:px-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-400">
                Diferencial
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Mais praticidade para o cliente, mais controle para a barbearia
              </h2>
            </div>

            <div className="space-y-3 text-zinc-300">
              <p>• Agendamento online rápido</p>
              <p>• Organização da agenda do barbeiro</p>
              <p>• Contato facilitado pelo WhatsApp</p>
              <p>• Venda de produtos no mesmo site</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}