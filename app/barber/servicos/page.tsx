import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { ServicesSection } from "../_components/ServicesSection";
import { getBarberDashboardData } from "../data";
import { requireActiveBarber } from "../guard";

export default async function BarberServicesPage({
}: {
  searchParams?: { feedback?: string; tone?: string };
}) {
  const { session } = await requireActiveBarber();
  const dashboard = await getBarberDashboardData(session.user.id, {
    view: "day",
    status: "ALL",
  });

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

      <div className="mt-6">
        <ServicesSection services={dashboard.services} />
      </div>
    </div>
  );
}
