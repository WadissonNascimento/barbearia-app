import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { getFinanceDashboardData } from "@/lib/financeReports";
import ComparisonControls from "./ComparisonControls";
import FinancePeriodFilters from "./FinancePeriodFilters";
import FinanceHistoryFilters from "./FinanceHistoryFilters";
import GeneratePayoutsButton from "./GeneratePayoutsButton";
import PayoutActionPanel from "./PayoutActionPanel";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDelta(current: number, previous: number, mode: "currency" | "number" = "currency") {
  const delta = current - previous;
  const prefix = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const absolute = Math.abs(delta);

  if (mode === "number") {
    return `${prefix}${absolute.toLocaleString("pt-BR")}`;
  }

  return `${prefix}${formatCurrency(absolute)}`;
}

function getDeltaTone(current: number, previous: number) {
  if (current > previous) return "text-emerald-300";
  if (current < previous) return "text-rose-300";
  return "text-zinc-300";
}

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams?: {
    period?: "week" | "month" | "custom";
    start?: string;
    end?: string;
    historyStart?: string;
    historyEnd?: string;
    compareMode?: "auto" | "custom";
    compareStart?: string;
    compareEnd?: string;
  };
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const data = await getFinanceDashboardData({
    period: searchParams?.period,
    start: searchParams?.start,
    end: searchParams?.end,
    historyStart: searchParams?.historyStart,
    historyEnd: searchParams?.historyEnd,
    compareMode: searchParams?.compareMode,
    compareStart: searchParams?.compareStart,
    compareEnd: searchParams?.compareEnd,
  });
  const maxDailyRevenue = Math.max(
    ...data.analytics.dailySeries.map((item) => item.grossRevenue),
    1
  );
  const maxWeekdayRevenue = Math.max(
    ...data.analytics.weekdayPerformance.map((item) => item.grossRevenue),
    1
  );
  const maxServiceRevenue = Math.max(
    ...data.analytics.topServices.map((item) => item.grossRevenue),
    1
  );
  const maxBarberRevenue = Math.max(
    ...data.analytics.barberInsights.map((item) => item.grossRevenue),
    1
  );
  const topThreeBarbers = data.analytics.barberInsights.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <PageHeader
        title="Financeiro da barbearia"
        description="Veja quanto entrou, quanto deve ser pago aos barbeiros e o que fica para a barbearia."
        actions={
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao admin
          </Link>
        }
      />

      <SectionCard
        title="Escolha o periodo"
        description="Selecione os dias que quer analisar antes de gerar ou pagar os repasses."
        className="mt-6"
      >
        <FinancePeriodFilters
          period={data.filters.period}
          start={data.filters.start}
          end={data.filters.end}
        />
      </SectionCard>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <SectionCard title="Entrou no caixa" description="Total vendido em servicos no periodo.">
          <p className="text-3xl font-semibold text-white">
            {formatCurrency(data.summary.grossRevenue)}
          </p>
        </SectionCard>

        <SectionCard title="A pagar aos barbeiros" description="Soma dos repasses do periodo.">
          <p className="text-3xl font-semibold text-amber-300">
            {formatCurrency(data.summary.commissionTotal)}
          </p>
        </SectionCard>

        <SectionCard title="Fica para a barbearia" description="Valor da casa depois dos repasses.">
          <p className="text-3xl font-semibold text-emerald-300">
            {formatCurrency(data.summary.shopNetRevenue)}
          </p>
        </SectionCard>

        <SectionCard title="Atendimentos feitos" description="Servicos concluidos no periodo.">
          <p className="text-3xl font-semibold text-white">
            {data.summary.appointmentsCount}
          </p>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8">
        <SectionCard
          title="Barbeiros que mais faturaram"
          description="Os 3 profissionais com maior venda de servicos no periodo."
        >
          {topThreeBarbers.length === 0 ? (
            <EmptyState
              title="Sem ranking ainda"
              description="A lista aparece quando houver atendimentos concluidos no periodo."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {topThreeBarbers.map((barber, index) => (
                <div
                  key={barber.barberId}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                    #{index + 1} colocado
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">{barber.barberName}</p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {formatCurrency(barber.grossRevenue)}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {barber.appointmentsCount} atendimento(s) - {barber.revenueShare}% do total vendido
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Comparar periodos"
          description={`Comparando com ${new Date(
            `${data.comparison.previousRange.start}T00:00:00`
          ).toLocaleDateString("pt-BR")} ate ${new Date(
            `${data.comparison.previousRange.end}T00:00:00`
          ).toLocaleDateString("pt-BR")}.`}
        >
          <ComparisonControls
            period={data.filters.period}
            start={data.filters.start}
            end={data.filters.end}
            historyStart={data.filters.historyStart}
            historyEnd={data.filters.historyEnd}
            compareMode={data.filters.compareMode as "auto" | "custom"}
            compareStart={data.filters.compareStart}
            compareEnd={data.filters.compareEnd}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Entrou no caixa</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(data.comparison.current.grossRevenue)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Periodo comparado: {formatCurrency(data.comparison.previous.grossRevenue)}
              </p>
              <p className={`mt-1 text-sm ${getDeltaTone(
                data.comparison.current.grossRevenue,
                data.comparison.previous.grossRevenue
              )}`}>
                Mudanca: {formatDelta(
                  data.comparison.current.grossRevenue,
                  data.comparison.previous.grossRevenue
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Fica para a barbearia</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">
                {formatCurrency(data.comparison.current.shopNetRevenue)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Periodo comparado: {formatCurrency(data.comparison.previous.shopNetRevenue)}
              </p>
              <p className={`mt-1 text-sm ${getDeltaTone(
                data.comparison.current.shopNetRevenue,
                data.comparison.previous.shopNetRevenue
              )}`}>
                Mudanca: {formatDelta(
                  data.comparison.current.shopNetRevenue,
                  data.comparison.previous.shopNetRevenue
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">A pagar aos barbeiros</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">
                {formatCurrency(data.comparison.current.commissionTotal)}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Periodo comparado: {formatCurrency(data.comparison.previous.commissionTotal)}
              </p>
              <p className={`mt-1 text-sm ${getDeltaTone(
                data.comparison.current.commissionTotal,
                data.comparison.previous.commissionTotal
              )}`}>
                Mudanca: {formatDelta(
                  data.comparison.current.commissionTotal,
                  data.comparison.previous.commissionTotal
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-400">Atendimentos feitos</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {data.comparison.current.appointmentsCount}
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Periodo comparado: {data.comparison.previous.appointmentsCount}
              </p>
              <p className={`mt-1 text-sm ${getDeltaTone(
                data.comparison.current.appointmentsCount,
                data.comparison.previous.appointmentsCount
              )}`}>
                Mudanca: {formatDelta(
                  data.comparison.current.appointmentsCount,
                  data.comparison.previous.appointmentsCount,
                  "number"
                )}
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Para onde foi o dinheiro"
          description="Separacao simples entre total vendido, repasse dos barbeiros e valor da barbearia."
        >
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="h-5 overflow-hidden rounded-full bg-zinc-800">
              <div className="flex h-full">
                <div
                  className="bg-amber-400"
                  style={{ width: `${data.summary.payoutRate}%` }}
                />
                <div
                  className="bg-emerald-400"
                  style={{ width: `${data.summary.netRate}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total vendido</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(data.summary.grossRevenue)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">100% dos servicos pagos</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Barbeiros</p>
                <p className="mt-2 text-lg font-semibold text-amber-300">
                  {formatCurrency(data.summary.commissionTotal)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{data.summary.payoutRate}% do total vendido</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Barbearia</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  {formatCurrency(data.summary.shopNetRevenue)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">{data.summary.netRate}% do total vendido</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8">
        <SectionCard
          title="Resumo rapido"
          description="Principais pontos do periodo: ticket medio, melhor dia e movimento."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Valor medio por atendimento
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {formatCurrency(data.summary.averageTicket)}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Media de quanto cada atendimento gerou.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Melhor dia do periodo
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {data.analytics.topDay?.label || "--"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {data.analytics.topDay
                  ? `${formatCurrency(data.analytics.topDay.grossRevenue)} em servicos`
                  : "Sem dados suficientes"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Dia mais cheio
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {data.analytics.busiestDay?.label || "--"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {data.analytics.busiestDay
                  ? `${data.analytics.busiestDay.appointmentsCount} atendimentos`
                  : "Sem atendimentos no periodo"}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                Melhor dia da semana
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">
                {data.analytics.weekdayPerformance[0]?.label || "--"}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {data.analytics.weekdayPerformance[0]
                  ? `${formatCurrency(data.analytics.weekdayPerformance[0].grossRevenue)} acumulados`
                  : "Sem historico no filtro"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Movimento por dia"
          description="Veja em quais dias entrou mais dinheiro e quantos atendimentos foram feitos."
        >
          {data.analytics.dailySeries.length === 0 ? (
            <EmptyState
              title="Sem movimento no periodo"
              description="Quando houver atendimentos concluidos, a serie diaria aparecera aqui."
            />
          ) : (
            <div className="space-y-4">
              {data.analytics.dailySeries.map((day) => (
                <div key={day.date} className="grid gap-2 md:grid-cols-[88px_1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{day.label}</p>
                    <p className="text-xs text-zinc-500">
                      {day.appointmentsCount} atendimento(s)
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300"
                      style={{
                        width: `${Math.max(
                          10,
                          (day.grossRevenue / maxDailyRevenue) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(day.grossRevenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Dias da semana"
          description="Mostra quais dias costumam vender mais dentro do periodo escolhido."
        >
          {data.analytics.weekdayPerformance.length === 0 ? (
            <EmptyState
              title="Sem padrao semanal ainda"
              description="Os melhores dias da semana aparecerao quando o periodo tiver movimentacao."
            />
          ) : (
            <div className="space-y-3">
              {data.analytics.weekdayPerformance.map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold capitalize text-white">{item.label}</p>
                    <p className="text-sm text-zinc-400">
                      {item.appointmentsCount} atendimento(s)
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{
                        width: `${Math.max(
                          12,
                          (item.grossRevenue / maxWeekdayRevenue) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-amber-300">
                    {formatCurrency(item.grossRevenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <SectionCard
          title="Dias mais fortes"
          description="Quanto mais destacada a cor, maior foi o faturamento daquele dia."
        >
          {data.analytics.weekdayPerformance.length === 0 ? (
            <EmptyState
              title="Sem movimento semanal"
              description="Quando houver faturamento no periodo, os dias mais fortes aparecerao aqui."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {data.analytics.weekdayPerformance.map((item) => {
                const intensity = Math.max(
                  0.18,
                  item.grossRevenue / maxWeekdayRevenue
                );

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-zinc-800 p-4"
                    style={{
                      backgroundColor: `rgba(56, 189, 248, ${intensity})`,
                    }}
                  >
                    <p className="text-sm font-semibold capitalize text-white">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatCurrency(item.grossRevenue)}
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      {item.appointmentsCount} atendimento(s)
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Valores por barbeiro"
          description="Compare quanto cada profissional vendeu, quanto recebe e quanto fica para a barbearia."
        >
          {data.analytics.barberInsights.length === 0 ? (
            <EmptyState
              title="Sem comparativo por barbeiro"
              description="O grafico aparece quando houver faturamento no periodo."
            />
          ) : (
            <div className="space-y-5">
              {data.analytics.barberInsights.map((barber) => (
                <div key={barber.barberId} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{barber.barberName}</p>
                    <p className="text-sm text-zinc-400">
                      {barber.appointmentsCount} atendimento(s)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <MetricBar
                      label="Total vendido"
                      value={barber.grossRevenue}
                      color="bg-sky-400"
                      maxValue={maxBarberRevenue}
                    />
                    <MetricBar
                      label="Repasse"
                      value={barber.commissionTotal}
                      color="bg-amber-400"
                      maxValue={maxBarberRevenue}
                    />
                    <MetricBar
                      label="Barbearia"
                      value={barber.shopNetRevenue}
                      color="bg-emerald-400"
                      maxValue={maxBarberRevenue}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Servicos que mais venderam"
          description="Lista dos servicos que mais geraram dinheiro no periodo."
        >
          {data.analytics.topServices.length === 0 ? (
            <EmptyState
              title="Sem servicos no periodo"
              description="Os servicos mais vendidos aparecerao aqui quando houver faturamento."
            />
          ) : (
            <div className="space-y-3">
              {data.analytics.topServices.slice(0, 5).map((service) => (
                <div key={service.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{service.label}</p>
                    <p className="text-sm text-zinc-400">{service.count} vezes</p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${Math.max(
                          12,
                          (service.grossRevenue / maxServiceRevenue) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-300">
                    {formatCurrency(service.grossRevenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Detalhe por barbeiro"
          description="Faturamento, melhor dia e repasse de cada profissional."
        >
          {data.analytics.barberInsights.length === 0 ? (
            <EmptyState
              title="Nenhum barbeiro com faturamento"
              description="Os destaques por barbeiro aparecerao quando houver atendimentos concluidos."
            />
          ) : (
            <div className="space-y-4">
              {data.analytics.barberInsights.map((barber) => (
                <div key={barber.barberId} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-[220px]">
                      <p className="text-lg font-semibold text-white">{barber.barberName}</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {barber.appointmentsCount} atendimento(s) concluido(s)
                      </p>
                      <p className="mt-3 text-sm text-zinc-500">
                        Melhor dia:{" "}
                        <span className="font-medium text-zinc-300">
                          {barber.bestDay?.label || "--"}
                        </span>
                      </p>
                      <p className="text-sm text-zinc-500">
                        {barber.bestDay
                          ? `${formatCurrency(barber.bestDay.grossRevenue)} em ${barber.bestDay.appointmentsCount} atendimento(s)`
                          : "Sem destaque diario ainda"}
                      </p>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-sky-400 to-emerald-400"
                          style={{
                            width: `${Math.max(
                              12,
                              (barber.grossRevenue / maxBarberRevenue) * 100
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Total vendido
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {formatCurrency(barber.grossRevenue)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Repasse
                          </p>
                          <p className="mt-2 text-sm font-semibold text-amber-300">
                            {formatCurrency(barber.commissionTotal)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Fica para a barbearia
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-300">
                            {formatCurrency(barber.shopNetRevenue)}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Parte do faturamento
                          </p>
                          <p className="mt-2 text-sm font-semibold text-sky-300">
                            {barber.revenueShare}%
                          </p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                            Parte dos repasses
                          </p>
                          <p className="mt-2 text-sm font-semibold text-amber-300">
                            {barber.payoutShare}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Gerar repasse dos barbeiros"
        description="Confira os valores do periodo e salve o fechamento para cada barbeiro."
        className="mt-8"
        actions={
          <GeneratePayoutsButton
            filters={{
              period: data.filters.period,
              start: data.filters.start,
              end: data.filters.end,
              historyStart: data.filters.historyStart,
              historyEnd: data.filters.historyEnd,
              compareMode: data.filters.compareMode,
              compareStart: data.filters.compareStart,
              compareEnd: data.filters.compareEnd,
            }}
          />
        }
      >
        {data.barberPayouts.length === 0 ? (
          <EmptyState
            title="Nenhum fechamento para mostrar"
            description="Conclua atendimentos no periodo escolhido para gerar os repasses."
          />
        ) : (
          <div className="space-y-4">
            {data.barberPayouts.map((item) => (
              <div
                key={item.barberId}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.barberName}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.appointmentsCount} atendimentos concluidos no periodo
                    </p>
                    <div className="mt-3">
                      <StatusBadge
                        variant={
                          item.savedStatus === "PAID"
                            ? "success"
                            : item.savedStatus === "CLOSED"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {item.savedStatus === "PAID"
                          ? "Pago"
                          : item.savedStatus === "CLOSED"
                          ? "Fechado"
                          : "Aberto"}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="grid gap-1 text-right text-sm">
                    <p className="text-zinc-400">Total vendido: {formatCurrency(item.grossRevenue)}</p>
                    <p className="text-amber-300">
                      A pagar: {formatCurrency(item.commissionTotal)}
                    </p>
                    <p className="text-emerald-300">
                      Fica para a barbearia: {formatCurrency(item.shopNetRevenue)}
                    </p>
                    {item.savedPaidAt && (
                      <p className="text-xs text-zinc-500">
                        Pago em {new Date(item.savedPaidAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>

                {item.savedPayoutId && (
                  <div className="mt-4">
                    <PayoutActionPanel
                      payoutId={item.savedPayoutId}
                      status={item.savedStatus || "OPEN"}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Fechamentos salvos"
        description="Ultimos repasses gerados e pagos para consulta rapida."
        className="mt-8"
        actions={
          <FinanceHistoryFilters
            historyStart={data.filters.historyStart}
            historyEnd={data.filters.historyEnd}
          />
        }
      >
        {data.history.length === 0 ? (
          <EmptyState
            title="Sem historico ainda"
            description="Os fechamentos realizados aparecerao aqui."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">Total vendido</th>
                  <th className="px-4 py-3">Repasse</th>
                  <th className="px-4 py-3">Barbearia</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pago em</th>
                  <th className="px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-800 text-sm">
                    <td className="px-4 py-3">{item.barber.name || "Barbeiro"}</td>
                    <td className="px-4 py-3">
                      {new Date(item.periodStart).toLocaleDateString("pt-BR")} ate{" "}
                      {new Date(item.periodEnd).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(item.grossRevenue)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.commissionTotal)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.shopNetRevenue)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          item.status === "PAID"
                            ? "success"
                            : item.status === "CLOSED"
                            ? "warning"
                            : "neutral"
                        }
                      >
                        {item.status === "PAID"
                          ? "Pago"
                          : item.status === "CLOSED"
                          ? "Fechado"
                          : "Aberto"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {item.paidAt
                        ? new Date(item.paidAt).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <PayoutActionPanel
                        payoutId={item.id}
                        status={item.status}
                        showDelete
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function MetricBar({
  label,
  value,
  color,
  maxValue,
}: {
  label: string;
  value: number;
  color: string;
  maxValue: number;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-[88px_1fr_auto] md:items-center">
      <p className="text-sm text-zinc-300">{label}</p>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${Math.max(10, (value / Math.max(maxValue, 1)) * 100)}%`,
          }}
        />
      </div>
      <p className="text-sm font-semibold text-white">{formatCurrency(value)}</p>
    </div>
  );
}
