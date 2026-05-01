import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import { normalizeProductImageUrl } from "@/lib/extraProductImages";
import AdminExtrasClient from "./AdminExtrasClient";

export default async function AdminExtrasPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  const extras = await prisma.extraProduct.findMany({
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <PageHeader
        title="Extras"
        description="Bebidas e itens simples vendidos junto ao atendimento."
        actions={
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar
          </Link>
        }
      />

      <AdminExtrasClient
        extras={extras.map((extra) => ({
          ...extra,
          imageUrl: normalizeProductImageUrl(extra.imageUrl),
        }))}
      />
    </div>
  );
}
