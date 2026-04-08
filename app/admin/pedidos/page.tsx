import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getOrders,
  confirmOrder,
  updateOrderStatus,
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
      <h1 className="text-3xl font-bold mb-6">Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-zinc-900 p-4 rounded-xl">
            <div className="flex justify-between">
              <div>
                <p><b>Cliente:</b> {order.customer.name || order.customer.email || "Cliente sem nome"}</p>
                <p><b>Total:</b> R$ {order.total.toFixed(2)}</p>
                <p><b>Status:</b> {orderStatusLabel[order.status]}</p>
              </div>

              <div className="flex gap-2">
                {order.status === "PENDING" && (
                  <form action={confirmOrder.bind(null, order.id)}>
                    <button className="bg-green-600 px-3 py-1 rounded">
                      Aceitar
                    </button>
                  </form>
                )}

                <form action={deleteOrder.bind(null, order.id)}>
                  <button className="bg-red-600 px-3 py-1 rounded">
                    Excluir
                  </button>
                </form>
              </div>
            </div>

            {/* ALTERAR STATUS */}
            <form
              action={async (formData) => {
                "use server";
                const status = formData.get("status") as any;
                await updateOrderStatus(order.id, status);
              }}
              className="mt-3"
            >
              <select
                name="status"
                defaultValue={order.status}
                className="bg-black p-2 rounded"
              >
                <option value="PENDING">Aguardando</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PREPARING">Em preparo</option>
                <option value="SHIPPED">Saiu</option>
                <option value="READY_FOR_PICKUP">Retirada</option>
                <option value="DELIVERED">Entregue</option>
                <option value="CANCELLED">Cancelado</option>
              </select>

              <button className="ml-2 bg-blue-600 px-3 py-1 rounded">
                Atualizar
              </button>
            </form>

            {/* ITENS */}
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
