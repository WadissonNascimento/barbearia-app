import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default async function AdminPage() {
  const [appointments, products, orders] = await Promise.all([
    prisma.appointment.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { items: { include: { product: true } } } })
  ]);

  const todayAppointments = appointments.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length;
  const paidRevenue = orders.filter((o) => o.status === "paid").reduce((acc, order) => acc + order.total, 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Painel do barbeiro</h1>
          <p className="mt-2 text-zinc-400">Visualize agenda, vendas e produtos.</p>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Agendamentos hoje</p>
          <p className="mt-2 text-3xl font-bold text-white">{todayAppointments}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Produtos cadastrados</p>
          <p className="mt-2 text-3xl font-bold text-white">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Receita paga</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{formatCurrency(paidRevenue)}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-white">Últimos agendamentos</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-800">
            <table className="min-w-full bg-zinc-900 text-sm">
              <thead className="bg-zinc-950 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Serviço</th>
                  <th className="px-4 py-3 text-left">Barbeiro</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Hora</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-t border-zinc-800 text-zinc-200">
                    <td className="px-4 py-3">{appointment.customer}</td>
                    <td className="px-4 py-3">{appointment.service}</td>
                    <td className="px-4 py-3">{appointment.barber}</td>
                    <td className="px-4 py-3">{appointment.date}</td>
                    <td className="px-4 py-3">{appointment.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold text-white">Pedidos</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{order.customerName}</p>
                    <p className="text-sm text-zinc-400">{order.customerEmail}</p>
                  </div>
                  <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase text-zinc-300">{order.status}</span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-zinc-300">
                  {order.items.map((item) => (
                    <p key={item.id}>{item.product.name} x {item.quantity}</p>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-emerald-400">{formatCurrency(order.total)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
