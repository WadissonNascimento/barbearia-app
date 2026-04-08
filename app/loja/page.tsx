import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/AddToCartButton";

export default async function LojaPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Loja</h1>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-zinc-300">Nenhum produto disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
              >
                <div className="h-56 w-full bg-zinc-800">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold">{p.name}</h2>

                  {p.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-zinc-400">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-500">
                      Sem descrição
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold">
                      R$ {Number(p.price).toFixed(2)}
                    </p>
                    <span className="text-sm text-zinc-400">
                      Estoque: {p.stock}
                    </span>
                  </div>

                  <div className="mt-4">
                    <AddToCartButton product={p} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}