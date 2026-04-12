"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function FinanceHistoryFilters({
  historyStart,
  historyEnd,
}: {
  historyStart: string;
  historyEnd: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({ historyStart, historyEnd });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFilters({ historyStart, historyEnd });
  }, [historyEnd, historyStart]);

  function applyFilters(next: typeof filters) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.historyStart) {
      params.set("historyStart", next.historyStart);
    } else {
      params.delete("historyStart");
    }

    if (next.historyEnd) {
      params.set("historyEnd", next.historyEnd);
    } else {
      params.delete("historyEnd");
    }

    startTransition(() => {
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false }
      );
    });
  }

  return (
    <form className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-2 block text-xs text-zinc-400">De</label>
        <input
          type="date"
          name="historyStart"
          value={filters.historyStart}
          onChange={(event) => {
            const next = {
              ...filters,
              historyStart: event.target.value,
            };

            setFilters(next);
            applyFilters(next);
          }}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs text-zinc-400">Ate</label>
        <input
          type="date"
          name="historyEnd"
          value={filters.historyEnd}
          onChange={(event) => {
            const next = {
              ...filters,
              historyEnd: event.target.value,
            };

            setFilters(next);
            applyFilters(next);
          }}
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none"
        />
      </div>

      <p className="pb-1 text-xs text-zinc-500">
        {isPending ? "Atualizando lista..." : "A lista muda automaticamente ao trocar as datas."}
      </p>
    </form>
  );
}
