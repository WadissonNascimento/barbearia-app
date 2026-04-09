import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  confirmOrder,
  saveTrackingCode,
  deleteOrder,
} from "@/app/actions/orderActions";
import FormFeedback from "@/components/FormFeedback";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  ADMIN_ORDER_STATUSES,
  getAdminOrdersReport,
} from "@/lib/adminReports";
import { buildFeedbackRedirect, readPageFeedback } from "@/lib/pageFeedback";
import { orderStatusLabel, orderStatusVariant } from "@/lib/orderStatus";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams?: {
    feedback?: string;
    tone?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  };
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const dateFrom = searchParams?.dateFrom || "";
  const dateTo = searchParams?.dateTo || "";
  const status = searchParams?.status || "";
  const filters = { dateFrom, dateTo, status };
  const { orders, summary } = await getAdminOrdersReport(filters);
  const feedback = readPageFeedback(searchParams);
  const exportParams = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => Boolean(value))
  ).toString();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <PageHeader
        title="Pedidos"
        description="Acompanhe os pedidos da loja, confirme pagamentos e registre rastreios."
        actions={
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao admin
          </Link>
        }
      />

      <FormFeedback
        success={feedback?.tone === "success" ? feedback.message : null}
        error={feedback?.tone === "error" ? feedback.message : null}
        info={feedback?.tone === "info" ? feedback.message : null}
      />

      <SectionCard
        title="Filtros"
        description="Refine os pedidos por periodo e status antes de exportar."
        className="mt-6"
      >
        <form className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">De</label>
            <input
              type="date"
              name="dateFrom"
              defaultValue={dateFrom}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Ate</label>
            <input
              type="date"
              name="dateTo"
              defaultValue={dateTo}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
            >
              <option value="">Todos</option>
              {ADMIN_ORDER_STATUSES.map((orderStatus) => (
                <option key={orderStatus} value={orderStatus}>
                  {orderStatusLabel[orderStatus]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
            >
              Filtrar
            </button>
          </div>
        </form>
      </SectionCard>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <SectionCard title="Pedidos" description="Total dentro do filtro atual.">
          <p className="text-3xl font-semibold text-white">{summary.total}</p>
        </SectionCard>

        <SectionCard
          title="Receita"
          description="Valor total sem considerar pedidos cancelados."
        >
          <p className="text-3xl font-semibold text-emerald-300">
            {summary.revenue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </SectionCard>

        <SectionCard
          title="Pendentes"
          description="Pedidos aguardando confirmacao."
        >
          <p className="text-3xl font-semibold text-amber-300">
            {summary.pending}
          </p>
        </SectionCard>

        <SectionCard
          title="Atendidos"
          description="Pedidos enviados ou entregues."
        >
          <p className="text-3xl font-semibold text-sky-300">
            {summary.fulfilled}
          </p>
        </SectionCard>
      </div>

      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <EmptyState
            title="Nenhum pedido encontrado"
            description="Os novos pedidos da loja aparecerao aqui automaticamente."
          />
        ) : (
          <>
            <div className="flex justify-end">
              <Link
                href={
                  exportParams
                    ? `/admin/pedidos/export?${exportParams}`
                    : "/admin/pedidos/export"
                }
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Exportar CSV
              </Link>
            </div>

            {orders.map((order) => (
              <SectionCard
                key={order.id}
                title={order.customer.name || order.customer.email || "Cliente sem nome"}
                description={`Total do pedido: R$ ${order.total.toFixed(2)}`}
              >
              <div className="flex flex-wrap justify-between gap-4">
                <div className="space-y-2">
                  <div>
                    <StatusBadge variant={orderStatusVariant[order.status] || "neutral"}>
                      {orderStatusLabel[order.status]}
                    </StatusBadge>
                  </div>
                  <p>
                    <b>Endereco:</b> {order.shippingAddress || "Nao informado"}
                  </p>
                  <p>
                    <b>CEP:</b> {order.shippingZipCode || "Nao informado"}
                  </p>
                  <p>
                    <b>Frete:</b> {order.shippingMethod || "Nao informado"} - R$ {order.shippingCost.toFixed(2)}
                  </p>
                  <p>
                    <b>Subtotal:</b> R$ {order.subtotal.toFixed(2)}
                  </p>
                  <p>
                    <b>Desconto:</b> R$ {order.discountTotal.toFixed(2)}
                  </p>
                  <p>
                    <b>Cupom:</b> {order.coupon?.code || "Nenhum"}
                  </p>
                  <p>
                    <b>Rastreio:</b> {order.trackingCode || "Nao informado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {order.status === "PENDING" && (
                    <form
                      action={async () => {
                        "use server";
                        await confirmOrder(order.id);
                        redirect(
                          buildFeedbackRedirect(
                            "/admin/pedidos",
                            "Pedido confirmado com sucesso."
                          )
                        );
                      }}
                    >
                      <button className="rounded bg-green-600 px-3 py-2 text-sm font-semibold">
                        Aceitar
                      </button>
                    </form>
                  )}

                  <form
                    action={async () => {
                      "use server";
                      await deleteOrder(order.id);
                      redirect(
                        buildFeedbackRedirect(
                          "/admin/pedidos",
                          "Pedido excluido com sucesso."
                        )
                      );
                    }}
                  >
                    <button className="rounded bg-red-600 px-3 py-2 text-sm font-semibold">
                      Excluir
                    </button>
                  </form>
                </div>
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  const trackingCode = String(formData.get("trackingCode") || "");

                  try {
                    await saveTrackingCode(order.id, trackingCode);
                    redirect(
                      buildFeedbackRedirect(
                        "/admin/pedidos",
                        "Codigo de rastreio salvo com sucesso."
                      )
                    );
                  } catch (error) {
                    redirect(
                      buildFeedbackRedirect(
                        "/admin/pedidos",
                        error instanceof Error
                          ? error.message
                          : "Nao foi possivel salvar o rastreio.",
                        "error"
                      )
                    );
                  }
                }}
                className="mt-4 flex flex-wrap gap-2"
              >
                <input
                  name="trackingCode"
                  defaultValue={order.trackingCode || ""}
                  placeholder="Codigo de rastreio"
                  className="min-w-[240px] rounded bg-black px-3 py-2 text-white outline-none"
                />
                <button className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold">
                  Salvar rastreio
                </button>
              </form>

              <div className="mt-4">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.productNameSnapshot} x{item.quantity}
                  </p>
                ))}
              </div>
              </SectionCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
