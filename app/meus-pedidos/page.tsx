import Link from "next/link";
import { auth } from "@/auth";
import { getMyOrders } from "@/app/actions/orderActions";
import { orderStatusLabel } from "@/lib/orderStatus";
import { buildTrackingUrl } from "@/lib/tracking";

export default async function MeusPedidos() {
  const session = await auth();

  const orders = await getMyOrders(session!.user.id);

  return (
    <div className="p-6 text-white">
      <h1 className="mb-6 text-3xl">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const trackingUrl = order.trackingCode
            ? buildTrackingUrl(order.trackingCode)
            : null;

          return (
            <div key={order.id} className="rounded-xl bg-zinc-900 p-4">
              <p>
                <b>Status:</b> {orderStatusLabel[order.status]}
              </p>
              <p>
                <b>Total:</b> R$ {order.total.toFixed(2)}
              </p>
              <p>
                <b>Codigo de rastreio:</b> {order.trackingCode || "Aguardando"}
              </p>

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

              <div className="mt-2">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.product.name} x{item.quantity}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
