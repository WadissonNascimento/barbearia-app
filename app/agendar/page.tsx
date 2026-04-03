export default function AgendarPage() {
  return (
    <main className="relative min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-14">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
            Agendamento online  
          </span>

          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
            Agendar horário
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-zinc-300 sm:text-base">
            Escolha o serviço, o barbeiro, a data e o horário para reservar seu
            atendimento com praticidade.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_45%)] blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-300">
                    Formulário
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    Reserve seu horário
                  </h2>
                </div>

                <div className="hidden rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-zinc-300 sm:block">
                  Atendimento com hora marcada
                </div>
              </div>

              <form className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                  />

                  <input
                    type="text"
                    placeholder="WhatsApp"
                    className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                  />

                  <input
                    type="email"
                    placeholder="E-mail (opcional)"
                    className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                  />

                  <select className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition focus:border-sky-400/50 focus:bg-[#07101f]">
                    <option>Escolha o serviço</option>
                    <option>Corte</option>
                    <option>Barba</option>
                    <option>Corte + Barba</option>
                    <option>Sobrancelha</option>
                  </select>

                  <select className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition focus:border-sky-400/50 focus:bg-[#07101f]">
                    <option>Escolha o barbeiro</option>
                    <option>Jak</option>
                    <option>Ryan</option>
                    <option>Wadisson</option>
                  </select>

                  <input
                    type="date"
                    className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition focus:border-sky-400/50 focus:bg-[#07101f]"
                  />

                  <select className="rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition focus:border-sky-400/50 focus:bg-[#07101f] sm:col-span-2">
                    <option>Horário</option>
                    <option>09:00</option>
                    <option>10:00</option>
                    <option>11:00</option>
                    <option>13:00</option>
                    <option>14:00</option>
                    <option>15:00</option>
                    <option>16:00</option>
                    <option>17:00</option>
                  </select>
                </div>

                <textarea
                  placeholder="Observações"
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300">
                    Confirmação rápida e prática.
                  </div>

                  <button
                    type="submit"
                    className="rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition hover:bg-sky-400"
                  >
                    Confirmar agendamento
                  </button>
                </div>
              </form>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="rounded-2xl border border-sky-400/15 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
              Como funciona
            </div>

            <h3 className="mt-4 text-2xl font-semibold text-white">
              Processo simples
            </h3>

            <div className="mt-6 space-y-4">
              {[
                "O cliente escolhe serviço, barbeiro, data e horário.",
                "O sistema salva o agendamento no banco.",
                "A confirmação pode seguir para WhatsApp.",
                "O barbeiro visualiza o horário no painel.",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-zinc-400">
                Dica: mantenha seus horários sempre atualizados para evitar
                conflitos de agenda e melhorar a experiência do cliente.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
} 