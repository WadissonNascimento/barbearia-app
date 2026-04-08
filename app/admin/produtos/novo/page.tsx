"use client";

import { createProduct } from "@/app/actions/productActions";
import { useState } from "react";

export default function NovoProduto() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    await createProduct({
      name: form.get("name") as string,
      description: form.get("description") as string,
      price: Number(form.get("price")),
      imageUrl: form.get("imageUrl") as string,
      stock: Number(form.get("stock")),
    });

    window.location.href = "/admin/produtos";
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 text-white space-y-3">
      <h1 className="text-2xl">Novo Produto</h1>

      <input name="name" placeholder="Nome" className="p-2 bg-black w-full" />
      <input name="description" placeholder="Descrição" className="p-2 bg-black w-full" />
      <input name="price" placeholder="Preço" type="number" className="p-2 bg-black w-full" />
      <input name="imageUrl" placeholder="Imagem URL" className="p-2 bg-black w-full" />
      <input name="stock" placeholder="Estoque" type="number" className="p-2 bg-black w-full" />

      <button className="bg-green-600 px-4 py-2">
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}