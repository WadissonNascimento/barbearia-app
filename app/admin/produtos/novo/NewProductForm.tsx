"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import { createProductFromForm } from "@/app/actions/productActions";

export default function NewProductForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4 rounded-2xl bg-[var(--panel-bg)] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          try {
            await createProductFromForm(formData);
            setFeedback({
              message: "Produto criado com sucesso. Abrindo a lista...",
              tone: "success",
            });
            router.push("/admin/produtos");
            router.refresh();
          } catch (error) {
            setFeedback({
              message:
                error instanceof Error
                  ? error.message
                  : "Nao foi possivel criar o produto.",
              tone: "error",
            });
          }
        });
      }}
    >
      <div className="space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

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

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
