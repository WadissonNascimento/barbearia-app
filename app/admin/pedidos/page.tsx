import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getOrders,
  confirmOrder,
  saveTrackingCode,
  deleteOrder,
} from "@/app/actions/orderActions";
import { orderStatusLabel } from "@/lib/orderStatus";

export default async function AdminPedidosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const orders = await getOrders();

  return (
    <div className="p-6 text-white">
      <h1 className="mb-6 text-3xl font-bold">Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl bg-zinc-900 p-4">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p>
                  <b>Cliente:</b>{" "}
                  {order.customer.name ||
                    order.customer.email ||
                    "Cliente sem nome"}
                </p>
                <p>
                  <b>Total:</b> R$ {order.total.toFixed(2)}
                </p>
                <p>
                  <b>Status:</b> {orderStatusLabel[order.status]}
                </p>
                <p>
                  <b>Endereco:</b> {order.notes || "Nao informado"}
                </p>
                <p>
                  <b>Rastreio:</b> {order.trackingCode || "Nao informado"}
                </p>
              </div>

              <div className="flex gap-2">
                {order.status === "PENDING" && (
                  <form action={confirmOrder.bind(null, order.id)}>
                    <button className="rounded bg-green-600 px-3 py-1">
                      Aceitar
                    </button>
                  </form>
                )}

                <form action={deleteOrder.bind(null, order.id)}>
                  <button className="rounded bg-red-600 px-3 py-1">
                    Excluir
                  </button>
                </form>
              </div>
            </div>

            <form
              action={async (formData) => {
                "use server";
                const trackingCode = String(formData.get("trackingCode") || "");
                await saveTrackingCode(order.id, trackingCode);
              }}
              className="mt-4 flex flex-wrap gap-2"
            >
              <input
                name="trackingCode"
                defaultValue={order.trackingCode || ""}
                placeholder="Codigo de rastreio"
                className="min-w-[240px] rounded bg-black px-3 py-2 text-white outline-none"
              />
              <button className="rounded bg-sky-600 px-3 py-2">
                Salvar rastreio
              </button>
            </form>

            <div className="mt-3">
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.product.name} x{item.quantity}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
