import { auth } from "@/auth";
import { getMyOrders } from "@/app/actions/orderActions";
import { orderStatusLabel } from "@/lib/orderStatus";

export default async function MeusPedidos() {
  const session = await auth();

  const orders = await getMyOrders(session!.user.id);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl mb-6">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-zinc-900 p-4 rounded-xl">

            <p><b>Status:</b> {orderStatusLabel[order.status]}</p>
            <p><b>Total:</b> R$ {order.total}</p>

            {/* TIMELINE */}
            <div className="mt-3 text-sm text-zinc-400">
              <p>Pedido realizado ✔</p>
              {order.status !== "PENDING" && <p>Confirmado ✔</p>}
              {(order.status === "PREPARING" || order.status === "SHIPPED" || order.status === "DELIVERED") && <p>Em preparo ✔</p>}
              {(order.status === "SHIPPED" || order.status === "DELIVERED") && <p>Enviado ✔</p>}
              {order.status === "DELIVERED" && <p>Entregue ✔</p>}
            </div>

            {/* ITENS */}
            <div className="mt-2">
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