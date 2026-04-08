import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  deleteProduct,
  toggleProduct,
  updateProductImage,
} from "@/app/actions/productActions";
import { normalizeProductImageUrl } from "@/lib/productImageUrl";

export default async function ProdutosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Produtos</h1>

        <Link
          href="/admin/produtos/novo"
          className="rounded-xl bg-green-600 px-4 py-2"
        >
          Novo Produto
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((p) => {
          const imageUrl = normalizeProductImageUrl(p.imageUrl);

          return (
            <div
              key={p.id}
              className="grid gap-4 rounded-xl bg-zinc-900 p-4 md:grid-cols-[120px_1fr_auto]"
            >
              <div className="relative h-28 overflow-hidden rounded-xl bg-zinc-950">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                    Sem imagem
                  </div>
                )}
              </div>

              <div>
                <p>
                  <b>{p.name}</b>
                </p>
                <p>R$ {p.price.toFixed(2)}</p>
                <p>Estoque: {p.stock}</p>
                <p>{p.isActive ? "Ativo" : "Fora de cartaz"}</p>

                <form
                  action={updateProductImage}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="productId" value={p.id} />
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="max-w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-white"
                  />
                  <button className="rounded-lg bg-sky-600 px-3 py-2 text-sm">
                    Trocar imagem
                  </button>
                </form>
              </div>

              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await toggleProduct(p.id);
                  }}
                >
                  <button className="rounded bg-yellow-600 px-3 py-2">
                    {p.isActive ? "Ocultar" : "Ativar"}
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await deleteProduct(p.id);
                  }}
                >
                  <button className="rounded bg-red-600 px-3 py-2">
                    Excluir
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
