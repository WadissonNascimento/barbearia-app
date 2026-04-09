import Link from "next/link";
import FormFeedback from "@/components/FormFeedback";
import PageHeader from "@/components/ui/PageHeader";
import { ServicesSection } from "../_components/ServicesSection";
import { readPageFeedback } from "@/lib/pageFeedback";
import { getBarberDashboardData } from "../data";
import { requireActiveBarber } from "../guard";

export default async function BarberServicesPage({
  searchParams,
}: {
  searchParams?: { feedback?: string; tone?: string };
}) {
  const { session } = await requireActiveBarber();
  const dashboard = await getBarberDashboardData(session.user.id, {
    view: "today",
    status: "ALL",
  });
  const feedback = readPageFeedback(searchParams);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="Servicos do barbeiro"
        description="Cadastre e edite seus servicos exclusivos em uma pagina dedicada."
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
        <ServicesSection services={dashboard.services} redirectTo="/barber/servicos" />
      </div>
    </div>
  );
}
