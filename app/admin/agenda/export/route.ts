import { auth } from "@/auth";
import {
  buildAgendaCsv,
  getAdminAgendaReport,
  type AdminAgendaFilters,
} from "@/lib/adminReports";

function getFilename() {
  const today = new Date().toISOString().slice(0, 10);
  return `agenda-relatorio-${today}.csv`;
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Nao autenticado.", { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return new Response("Nao autorizado.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);

  const filters: AdminAgendaFilters = {
    barberId: searchParams.get("barberId") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
    status: searchParams.get("status") || "",
  };

  const { appointments } = await getAdminAgendaReport(filters);
  const csv = `\uFEFF${buildAgendaCsv(appointments)}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${getFilename()}"`,
    },
  });
}
