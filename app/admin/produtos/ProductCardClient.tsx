"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  deleteProduct,
  toggleProduct,
  updateProductImage,
} from "@/app/actions/productActions";

type ProductCardClientProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    stock: number;
    imageUrl: string | null;
    stockMovements: Array<{
      id: string;
      createdAt: Date;
      type: string;
      quantity: number;
      reason: string | null;
    }>;
  };
};

function stockMovementTypeLabel(type: string) {
  switch (type) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Saida";
    default:
      return type;
  }
}

export default function ProductCardClient({
  product,
}: ProductCardClientProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(product.isActive);
  const [feedback, setFeedback] = useState<{
    message: string | null;
    tone: "success" | "error" | "info";
  }>({ message: null, tone: "success" });
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runAction(
    key: string,
    action: () => Promise<void>,
    successMessage: string | (() => string)
  ) {
    setPendingKey(key);

    startTransition(async () => {
      try {
        await action();
        setFeedback({
          message:
            typeof successMessage === "function"
              ? successMessage()
              : successMessage,
          tone: "success",
        });
        router.refresh();
      } catch (error) {
        setFeedback({
          message:
            error instanceof Error
              ? error.message
              : "Nao foi possivel atualizar o produto.",
          tone: "error",
        });
      } finally {
        setPendingKey(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        <FeedbackMessage message={feedback.message} tone={feedback.tone} />
      </div>

      <div className="grid gap-4 md:grid-cols-[120px_1fr_auto]">
        <div className="relative h-28 overflow-hidden rounded-xl bg-zinc-950">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
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
            <StatusBadge variant={isActive ? "success" : "neutral"}>
              {isActive ? "Ativo" : "Oculto"}
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
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              runAction(
                "image",
                () => updateProductImage(formData),
                "Imagem atualizada com sucesso."
              );
            }}
          >
            <input type="hidden" name="productId" value={product.id} />
            <input
              name="image"
              type="file"
              accept="image/*"
              className="max-w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-white"
            />
            <button
              type="submit"
              disabled={isPending && pendingKey === "image"}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && pendingKey === "image"
                ? "Enviando..."
                : "Trocar imagem"}
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
                    {stockMovementTypeLabel(movement.type)} {movement.quantity}
                    {movement.reason ? ` - ${movement.reason}` : ""}
                  </p>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending && pendingKey === "toggle"}
            onClick={() =>
              runAction(
                "toggle",
                async () => {
                  const updatedProduct = await toggleProduct(product.id);
                  setIsActive(updatedProduct.isActive);
                },
                () => (isActive ? "Produto ocultado." : "Produto ativado.")
              )
            }
            className="rounded bg-yellow-600 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && pendingKey === "toggle"
              ? "Salvando..."
              : isActive
              ? "Ocultar"
              : "Ativar"}
          </button>

          <button
            type="button"
            disabled={isPending && pendingKey === "delete"}
            onClick={() =>
              runAction(
                "delete",
                () => deleteProduct(product.id),
                "Produto excluido com sucesso."
              )
            }
            className="rounded bg-red-600 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && pendingKey === "delete" ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
