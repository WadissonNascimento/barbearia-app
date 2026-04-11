"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function OrdersFilters({
  dateFrom,
  dateTo,
  status,
  statusOptions,
}: {
  dateFrom: string;
  dateTo: string;
  status: string;
  statusOptions: Array<{ value: string; label: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState({ dateFrom, dateTo, status });
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="grid gap-4 md:grid-cols-4"
      onSubmit={(event) => {
        event.preventDefault();
        const params = new URLSearchParams();

        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
        if (filters.status) params.set("status", filters.status);

        startTransition(() => {
          router.replace(
            params.toString() ? `${pathname}?${params.toString()}` : pathname,
            { scroll: false }
          );
        });
      }}
    >
      <div>
        <label className="mb-2 block text-sm text-zinc-300">De</label>
        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Ate</label>
        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-zinc-300">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
        >
          <option value="">Todos</option>
          {statusOptions.map((orderStatus) => (
            <option key={orderStatus.value} value={orderStatus.value}>
              {orderStatus.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Filtrando..." : "Filtrar"}
        </button>
      </div>
    </form>
  );
}
