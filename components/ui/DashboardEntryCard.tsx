import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export default function DashboardEntryCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-zinc-800 bg-[linear-gradient(160deg,rgba(24,27,37,0.94),rgba(11,12,18,0.98))] p-5 transition hover:border-zinc-700 hover:bg-[linear-gradient(160deg,rgba(31,35,48,0.98),rgba(11,12,18,0.98))]"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-[#d4a15d]">
          <Icon className="h-8 w-8" strokeWidth={1.8} />
        </div>
        {badge ? (
          <span className="rounded-full border border-[#d4a15d]/30 bg-[#d4a15d]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e2ba85]">
            {badge}
          </span>
        ) : (
          <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:text-zinc-300" />
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      <div className="mt-5 flex items-center text-sm font-semibold text-[#d4a15d]">
        Abrir pagina
        <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
