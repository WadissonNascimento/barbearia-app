"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type ComparisonControlsProps = {
  period: string;
  start: string;
  end: string;
  historyStart: string;
  historyEnd: string;
  compareMode: "auto" | "custom";
  compareStart: string;
  compareEnd: string;
};

export default function ComparisonControls({
  period,
  start,
  end,
  historyStart,
  historyEnd,
  compareMode,
  compareStart,
  compareEnd,
}: ComparisonControlsProps) {
  const [mode, setMode] = useState<"auto" | "custom">(compareMode);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function submitCustomComparison(form: HTMLFormElement) {
    const formData = new FormData(form);
    const nextParams = new URLSearchParams(searchParams.toString());

    const nextCompareMode = String(formData.get("compareMode") || "auto");
    const nextCompareStart = String(formData.get("compareStart") || "");
    const nextCompareEnd = String(formData.get("compareEnd") || "");

    nextParams.set("compareMode", nextCompareMode);
    if (nextCompareStart) {
      nextParams.set("compareStart", nextCompareStart);
    } else {
      nextParams.delete("compareStart");
    }

    if (nextCompareEnd) {
      nextParams.set("compareEnd", nextCompareEnd);
    } else {
      nextParams.delete("compareEnd");
    }

    startTransition(() => {
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    });
  }

  return (
    <form className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
      <input type="hidden" name="period" value={period} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />
      <input type="hidden" name="historyStart" value={historyStart} />
      <input type="hidden" name="historyEnd" value={historyEnd} />

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm text-zinc-300">Comparar com</label>
          <select
            name="compareMode"
            value={mode}
            onChange={(event) => setMode(event.target.value as "auto" | "custom")}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
          >
            <option value="auto">Periodo anterior</option>
            <option value="custom">Periodo personalizado</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Inicio comparativo</label>
          <input
            type="date"
            name="compareStart"
            defaultValue={compareStart}
            readOnly={mode !== "custom"}
            aria-disabled={mode !== "custom"}
            onChange={(event) => {
              if (mode !== "custom") return;
              const form = event.currentTarget.form;
              if (!form) return;
              submitCustomComparison(form);
            }}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
              mode === "custom"
                ? "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                : "cursor-not-allowed border-zinc-800 bg-zinc-900/80 text-zinc-500"
            }`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">Fim comparativo</label>
          <input
            type="date"
            name="compareEnd"
            defaultValue={compareEnd}
            readOnly={mode !== "custom"}
            aria-disabled={mode !== "custom"}
            onChange={(event) => {
              if (mode !== "custom") return;
              const form = event.currentTarget.form;
              if (!form) return;
              submitCustomComparison(form);
            }}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
              mode === "custom"
                ? "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                : "cursor-not-allowed border-zinc-800 bg-zinc-900/80 text-zinc-500"
            }`}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        {mode === "custom"
          ? isPending
            ? "Atualizando comparativo..."
            : "O comparativo atualiza automaticamente ao trocar as datas."
          : "Para editar as datas, mude para periodo personalizado."}
      </p>
    </form>
  );
}
