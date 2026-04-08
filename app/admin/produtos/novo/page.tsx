import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createProductFromForm } from "@/app/actions/productActions";

export default async function NovoProduto() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/painel");

  async function submitProduct(formData: FormData) {
    "use server";
    await createProductFromForm(formData);
  }

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

      <form action={submitProduct} className="space-y-4 rounded-2xl bg-zinc-900 p-6">
        <input
          name="name"
          placeholder="Nome"
          className="w-full rounded-xl bg-black px-4 py-3"
          required
        />
        <textarea
          name="description"
          placeholder="Descricao"
          className="min-h-28 w-full rounded-xl bg-black px-4 py-3"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            name="price"
            placeholder="Preco"
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-xl bg-black px-4 py-3"
            required
          />
          <input
            name="stock"
            placeholder="Estoque"
            type="number"
            min="0"
            step="1"
            className="w-full rounded-xl bg-black px-4 py-3"
            required
          />
        </div>
        <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
          <label className="mb-2 block text-sm text-zinc-300">
            Imagem do produto
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-white"
          />
          <p className="mt-2 text-xs text-zinc-500">
            Selecione uma imagem salva no seu celular ou computador.
          </p>
        </div>

        <button className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold">
          Salvar
        </button>
      </form>
    </div>
  );
}
