import Link from "next/link";
import { auth } from "@/auth";
import { getMyOrders } from "@/app/actions/orderActions";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { orderStatusLabel, orderStatusVariant } from "@/lib/orderStatus";
import { buildTrackingUrl } from "@/lib/tracking";

export default async function MeusPedidos() {
  const session = await auth();
  const orders = await getMyOrders(session!.user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      <PageHeader
        title="Meus Pedidos"
        description="Acompanhe seus pedidos, rastreios e itens comprados."
        actions={
          <Link
            href="/meu-perfil"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao perfil
          </Link>
        }
      />

      <div className="space-y-4">
        {orders.length === 0 ? (
          <EmptyState
            title="Nenhum pedido encontrado"
            description="Quando voce finalizar uma compra, ela aparecera aqui."
            actionLabel="Ver produtos"
            actionHref="/produtos"
          />
        ) : (
          orders.map((order) => {
            const trackingUrl = order.trackingCode
              ? buildTrackingUrl(order.trackingCode)
              : null;

            return (
              <SectionCard
                key={order.id}
                title={`Pedido de ${new Date(order.createdAt).toLocaleDateString("pt-BR")}`}
                description={`Total: R$ ${order.total.toFixed(2)}`}
              >
                <div className="mb-4">
                  <StatusBadge variant={orderStatusVariant[order.status] || "neutral"}>
                    {orderStatusLabel[order.status]}
                  </StatusBadge>
                </div>

                <p>
                  <b>Codigo de rastreio:</b> {order.trackingCode || "Aguardando"}
                </p>
                <p>
                  <b>Entrega:</b> {order.shippingMethod || "Nao informada"}
                </p>
                <p>
                  <b>Endereco:</b> {order.shippingAddress || "Nao informado"}
                </p>
                <p>
                  <b>Subtotal:</b> R$ {order.subtotal.toFixed(2)}
                </p>
                <p>
                  <b>Frete:</b> R$ {order.shippingCost.toFixed(2)}
                </p>
                <p>
                  <b>Desconto:</b> R$ {order.discountTotal.toFixed(2)}
                </p>
                {order.coupon?.code && (
                  <p>
                    <b>Cupom:</b> {order.coupon.code}
                  </p>
                )}

                {trackingUrl && (
                  <div className="mt-3">
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                    >
                      Acompanhar rastreio
                    </a>
                  </div>
                )}

                <div className="mt-3 text-sm text-zinc-400">
                  <p>Pedido realizado</p>
                  {order.status !== "PENDING" && <p>Pedido aceito</p>}
                  {order.trackingCode && <p>Codigo de rastreio adicionado</p>}
                  {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                    <p>Enviado para entrega</p>
                  )}
                  {order.status === "DELIVERED" && <p>Entregue</p>}
                </div>

                <div className="mt-4">
                  {order.items.map((item) => (
                    <p key={item.id}>
                      {item.productNameSnapshot} x{item.quantity}
                    </p>
                  ))}
                </div>
              </SectionCard>
            );
          })
        )}
      </div>
    </div>
  );
}
