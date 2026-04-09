import Link from "next/link";
import FormFeedback from "@/components/FormFeedback";
import PageHeader from "@/components/ui/PageHeader";
import { AppointmentsSection } from "../_components/AppointmentsSection";
import { readPageFeedback } from "@/lib/pageFeedback";
import { getBarberDashboardData } from "../data";
import { requireActiveBarber } from "../guard";

type SearchParams = {
  view?: "today" | "upcoming" | "all";
  status?: string;
  date?: string;
  feedback?: string;
  tone?: string;
};

export default async function BarberAgendaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { session } = await requireActiveBarber();
  const dashboard = await getBarberDashboardData(session.user.id, searchParams);
  const feedback = readPageFeedback(searchParams);

  const params = new URLSearchParams();
  if (searchParams.view) params.set("view", searchParams.view);
  if (searchParams.status) params.set("status", searchParams.status);
  if (searchParams.date) params.set("date", searchParams.date);
  const redirectTo = params.toString()
    ? `/barber/agenda?${params.toString()}`
    : "/barber/agenda";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="Agenda do barbeiro"
        description="Aqui fica tudo que envolve seus atendimentos: filtros, status e proximos passos."
        actions={
          <Link
            href="/barber"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao painel
          </Link>
        }
      />

      <FormFeedback
        success={feedback?.tone === "success" ? feedback.message : null}
        error={feedback?.tone === "error" ? feedback.message : null}
        info={feedback?.tone === "info" ? feedback.message : null}
      />

      <div className="mt-6">
        <AppointmentsSection
          appointments={dashboard.appointments}
          filters={dashboard.filters}
          redirectTo={redirectTo}
        />
      </div>
    </div>
  );
}
