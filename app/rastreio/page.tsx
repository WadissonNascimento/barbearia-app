import { prisma } from "@/lib/prisma";
import { orderStatusLabel } from "@/lib/orderStatus";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Acompanhar rastreio</h1>
        <p className="mt-2 text-zinc-400">
          Digite o e-mail usado na compra para ver seus pedidos e o codigo de rastreio.
        </p>
      </div>

      <form method="GET" className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
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

      {email && orders.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-zinc-300">
          Nenhum pedido encontrado para esse e-mail.
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const trackingUrl = order.trackingCode
            ? buildTrackingUrl(order.trackingCode)
            : null;

          return (
            <div key={order.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p>
                    <b>Status:</b> {orderStatusLabel[order.status]}
                  </p>
                  <p>
                    <b>Total:</b> R$ {order.total.toFixed(2)}
                  </p>
                  <p>
                    <b>Endereco:</b> {order.notes || "Nao informado"}
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
                    {item.product.name} x{item.quantity}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
