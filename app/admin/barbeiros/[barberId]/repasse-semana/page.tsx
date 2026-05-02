import { getWeekRange } from "@/lib/financials";
import PayoutReport from "../PayoutReport";

export default function BarberWeekPayoutPage({
  params,
}: {
  params: { barberId: string };
}) {
  return (
    <PayoutReport
      barberId={params.barberId}
      title="Repasse da semana"
      description="Servicos e produtos concluidos nesta semana, com comissao individual."
      range={getWeekRange()}
    />
  );
}
