import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  deleteProduct,
  toggleProduct,
} from "@/app/actions/productActions";

export default async function ProdutosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const products = await prisma.product.findMany();

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Produtos</h1>

      <a href="/admin/produtos/novo" className="bg-green-600 px-4 py-2 rounded">
        Novo Produto
      </a>

      <div className="mt-6 space-y-4">
        {products.map((p) => (
          <div key={p.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between">

            <div>
              <p><b>{p.name}</b></p>
              <p>R$ {p.price}</p>
              <p>{p.isActive ? "Ativo" : "Fora de cartaz"}</p>
            </div>

            <div className="flex gap-2">
              <form
                action={async () => {
                  "use server";
                  await toggleProduct(p.id);
                }}
              >
                <button className="bg-yellow-600 px-3 py-1 rounded">
                  {p.isActive ? "Ocultar" : "Ativar"}
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await deleteProduct(p.id);
                }}
              >
                <button className="bg-red-600 px-3 py-1 rounded">
                  Excluir
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
