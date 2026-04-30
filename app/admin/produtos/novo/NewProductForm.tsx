"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import { createProductFromForm } from "@/app/actions/productActions";
import { prepareProductImageUpload } from "@/lib/productImageClient";

export default function NewProductForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [imageUpload, setImageUpload] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (imageUpload?.previewUrl) {
        URL.revokeObjectURL(imageUpload.previewUrl);
      }
    };
  }, [imageUpload]);

  return (
    <form
      className="space-y-4 rounded-2xl bg-[var(--panel-bg)] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          try {
            if (!imageUpload) {
              setFeedback({
                message: "Selecione uma imagem principal para o produto.",
                tone: "error",
              });
              return;
            }

            formData.set("image", imageUpload.file);
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
          accept="image/jpeg,image/png,image/webp"
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];

            if (!file) {
              setImageUpload(null);
              return;
            }

            try {
              const prepared = await prepareProductImageUpload(file);
              setImageUpload((current) => {
                if (current?.previewUrl) {
                  URL.revokeObjectURL(current.previewUrl);
                }

                return prepared;
              });
              setFeedback({ message: null, tone: "success" });
            } catch (error) {
              event.currentTarget.value = "";
              setImageUpload(null);
              setFeedback({
                message:
                  error instanceof Error
                    ? error.message
                    : "Nao foi possivel preparar a imagem.",
                tone: "error",
              });
            }
          }}
          className="w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-white"
          required
        />
        <p className="mt-2 text-xs text-zinc-500">
          JPG, PNG ou WEBP ate 2MB. O sistema remove bordas vazias, centraliza o produto
          e padroniza em 800x800 antes do envio.
        </p>
        {imageUpload ? (
          <div className="relative mt-4 aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#edf1f7]">
            <div className="pointer-events-none absolute inset-[5%] rounded-[18px] border border-black/8" />
            <img
              src={imageUpload.previewUrl}
              alt="Preview do produto"
              className="h-full w-full object-contain"
            />
          </div>
        ) : null}
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
