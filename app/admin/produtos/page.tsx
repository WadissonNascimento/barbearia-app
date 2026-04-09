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
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { normalizeProductImageUrl } from "@/lib/productImageUrl";

export default async function ProdutosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const products = await prisma.product.findMany({
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lowStockProducts = products.filter((product) => product.stock <= 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <PageHeader
        title="Produtos"
        description="Gerencie catalogo, estoque e sinais de reposicao da loja."
        actions={
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
            >
              Voltar ao admin
            </Link>
            <Link
              href="/admin/produtos/novo"
              className="rounded-xl bg-green-600 px-4 py-2"
            >
              Novo produto
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <SectionCard title="Produtos ativos" description="Itens disponiveis para venda.">
          <p className="text-3xl font-semibold text-white">
            {products.filter((product) => product.isActive).length}
          </p>
        </SectionCard>

        <SectionCard title="Estoque baixo" description="Produtos com 3 unidades ou menos.">
          <p className="text-3xl font-semibold text-amber-300">
            {lowStockProducts.length}
          </p>
        </SectionCard>

        <SectionCard title="Sem estoque" description="Itens indisponiveis no momento.">
          <p className="text-3xl font-semibold text-rose-300">
            {products.filter((product) => product.stock === 0).length}
          </p>
        </SectionCard>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nenhum produto cadastrado"
          description="Adicione o primeiro produto para iniciar a loja."
          actionLabel="Novo produto"
          actionHref="/admin/produtos/novo"
        />
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const imageUrl = normalizeProductImageUrl(product.imageUrl);

            return (
              <SectionCard
                key={product.id}
                title={product.name}
                description={`Preco atual: R$ ${product.price.toFixed(2)}`}
              >
                <div className="grid gap-4 md:grid-cols-[120px_1fr_auto]">
                  <div className="relative h-28 overflow-hidden rounded-xl bg-zinc-950">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge variant={product.isActive ? "success" : "neutral"}>
                        {product.isActive ? "Ativo" : "Oculto"}
                      </StatusBadge>
                      <StatusBadge
                        variant={
                          product.stock === 0
                            ? "danger"
                            : product.stock <= 3
                            ? "warning"
                            : "info"
                        }
                      >
                        Estoque: {product.stock}
                      </StatusBadge>
                    </div>

                    <p className="text-sm text-zinc-400">
                      {product.description || "Sem descricao cadastrada."}
                    </p>

                    <form
                      action={updateProductImage}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="productId" value={product.id} />
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

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                      <p className="text-sm font-medium text-white">
                        Ultimas movimentacoes
                      </p>
                      <div className="mt-2 space-y-1 text-sm text-zinc-400">
                        {product.stockMovements.length === 0 ? (
                          <p>Nenhuma movimentacao registrada ainda.</p>
                        ) : (
                          product.stockMovements.map((movement) => (
                            <p key={movement.id}>
                              {new Date(movement.createdAt).toLocaleDateString("pt-BR")} -{" "}
                              {movement.type} {movement.quantity}
                              {movement.reason ? ` - ${movement.reason}` : ""}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await toggleProduct(product.id);
                      }}
                    >
                      <button className="rounded bg-yellow-600 px-3 py-2">
                        {product.isActive ? "Ocultar" : "Ativar"}
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteProduct(product.id);
                      }}
                    >
                      <button className="rounded bg-red-600 px-3 py-2">
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
