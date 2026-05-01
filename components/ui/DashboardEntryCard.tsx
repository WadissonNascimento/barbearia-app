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
      className="group surface-card relative flex items-center gap-3 overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(21,28,44,0.96),rgba(12,17,28,0.98))] px-4 py-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition duration-200 hover:border-[var(--brand)]/25 hover:bg-white/[0.06]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/5 text-[var(--brand)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h2>
        <p className="mt-1 truncate text-xs text-zinc-400 sm:text-sm">{description}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {badge ? (
          <span className="rounded-full border border-[var(--brand)]/30 bg-[var(--brand-muted)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-strong)]">
            {badge}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-zinc-300" />
      </div>
    </Link>
  );
}
