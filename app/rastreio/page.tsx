import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { prisma } from "@/lib/prisma";
import { orderStatusLabel, orderStatusVariant } from "@/lib/orderStatus";
import { buildTrackingUrl } from "@/lib/tracking";

export default async function RastreioPage({
  searchParams,
}: {
  searchParams: {
    email?: string;
  };
}) {
  const email = String(searchParams.email || "").trim().toLowerCase();

  const orders = email
    ? await prisma.order.findMany({
        where: {
          customer: {
            email,
          },
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <PageHeader
        title="Acompanhar rastreio"
        description="Digite o e-mail usado na compra para ver seus pedidos e o codigo de rastreio."
      />

      <SectionCard
        title="Buscar pedidos"
        description="Consulte a situacao da entrega pelo e-mail da compra."
      >
        <form method="GET">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              name="email"
              type="email"
              defaultValue={email}
              placeholder="Digite seu e-mail"
              className="flex-1 rounded-xl bg-[#0a1324] px-4 py-3 text-white outline-none"
              required
            />
            <button className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-white">
              Buscar pedidos
            </button>
          </div>
        </form>
      </SectionCard>

      {email && orders.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Nenhum pedido encontrado"
            description="Revise o e-mail informado e tente novamente."
          />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {orders.map((order) => {
          const trackingUrl = order.trackingCode
            ? buildTrackingUrl(order.trackingCode)
            : null;

          return (
            <SectionCard
              key={order.id}
              title={`Pedido de ${new Date(order.createdAt).toLocaleDateString("pt-BR")}`}
              description={`Cliente: ${order.customer.name || order.customer.email}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3">
                    <StatusBadge variant={orderStatusVariant[order.status] || "neutral"}>
                      {orderStatusLabel[order.status]}
                    </StatusBadge>
                  </div>
                  <p>
                    <b>Total:</b> R$ {order.total.toFixed(2)}
                  </p>
                  <p>
                    <b>Endereco:</b> {order.shippingAddress || "Nao informado"}
                  </p>
                  <p>
                    <b>Frete:</b> {order.shippingMethod || "Nao informado"} - R$ {order.shippingCost.toFixed(2)}
                  </p>
                  <p>
                    <b>Desconto:</b> R$ {order.discountTotal.toFixed(2)}
                  </p>
                  <p>
                    <b>Codigo de rastreio:</b> {order.trackingCode || "Aguardando envio"}
                  </p>
                </div>

                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
                  >
                    Rastrear entrega
                  </a>
                )}
              </div>

              <div className="mt-4 text-sm text-zinc-400">
                <p>Pedido realizado</p>
                {order.status !== "PENDING" && <p>Pedido aceito pelo admin</p>}
                {order.trackingCode && <p>Codigo de rastreio informado</p>}
              </div>

              <div className="mt-4 space-y-1">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.productNameSnapshot} x{item.quantity}
                  </p>
                ))}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </main>
  );
}
