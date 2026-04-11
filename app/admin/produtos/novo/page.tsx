import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewProductForm from "./NewProductForm";

export default async function NovoProduto() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  return (
    <div className="mx-auto max-w-2xl p-6 text-white">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Novo Produto</h1>
        <Link
          href="/admin/produtos"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm"
        >
          Voltar
        </Link>
      </div>

      <NewProductForm />
    </div>
  );
}
