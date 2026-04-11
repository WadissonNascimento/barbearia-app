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
      className="group hairline-top surface-card relative overflow-hidden rounded-[28px] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)]/20 hover:bg-[linear-gradient(160deg,rgba(27,31,43,0.96),rgba(10,12,19,0.98))]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-[var(--brand)] sm:h-16 sm:w-16">
          <Icon className="h-8 w-8" strokeWidth={1.8} />
        </div>
        {badge ? (
          <span className="rounded-full border border-[var(--brand)]/30 bg-[var(--brand-muted)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-strong)]">
            {badge}
          </span>
        ) : (
          <ChevronRight className="h-5 w-5 text-zinc-600 transition group-hover:text-zinc-300" />
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      <div className="mt-5 flex items-center text-sm font-semibold text-[var(--brand)]">
        Abrir
        <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
