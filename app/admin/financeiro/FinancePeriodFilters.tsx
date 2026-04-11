"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Period = "week" | "month" | "custom";

export default function FinancePeriodFilters({
  period,
  start,
  end,
}: {
  period: Period;
  start: string;
  end: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ period, start, end });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFilters({ period, start, end });
  }, [end, period, start]);

  function applyFilters(next: typeof filters) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.period === "week") {
      params.delete("period");
      params.delete("start");
      params.delete("end");
    } else {
      params.set("period", next.period);

      if (next.period === "custom") {
        if (next.start) {
          params.set("start", next.start);
        } else {
          params.delete("start");
        }

        if (next.end) {
          params.set("end", next.end);
        } else {
          params.delete("end");
        }
      } else {
        params.delete("start");
        params.delete("end");
      }
    }

    startTransition(() => {
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false }
      );
    });
  }

  return (
    <form className="grid gap-4 md:grid-cols-3">
      <div>
        <label className="mb-2 block text-sm text-zinc-300">Periodo</label>
        <select
          name="period"
          value={filters.period}
          onChange={(event) => {
            const next = {
              ...filters,
              period: event.target.value as Period,
            };

            setFilters(next);
            applyFilters(next);
          }}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
        >
          <option value="week">Semana atual</option>
          <option value="month">Mes atual</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Inicio</label>
        <input
          type="date"
          name="start"
          value={filters.start}
          onChange={(event) => {
            const next = {
              ...filters,
              start: event.target.value,
            };

            setFilters(next);
            if (next.period === "custom") {
              applyFilters(next);
            }
          }}
          readOnly={filters.period !== "custom"}
          aria-disabled={filters.period !== "custom"}
          className={`w-full rounded-xl border px-4 py-3 outline-none ${
            filters.period === "custom"
              ? "border-zinc-700 bg-zinc-950"
              : "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-500"
          }`}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Fim</label>
        <input
          type="date"
          name="end"
          value={filters.end}
          onChange={(event) => {
            const next = {
              ...filters,
              end: event.target.value,
            };

            setFilters(next);
            if (next.period === "custom") {
              applyFilters(next);
            }
          }}
          readOnly={filters.period !== "custom"}
          aria-disabled={filters.period !== "custom"}
          className={`w-full rounded-xl border px-4 py-3 outline-none ${
            filters.period === "custom"
              ? "border-zinc-700 bg-zinc-950"
              : "cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-500"
          }`}
        />
      </div>

      <p className="text-xs text-zinc-500 md:col-span-3">
        {isPending
          ? "Atualizando periodo..."
          : filters.period === "custom"
          ? "As datas atualizam automaticamente."
          : "Troque o periodo para atualizar sem recarregar a pagina inteira."}
      </p>
    </form>
  );
}
