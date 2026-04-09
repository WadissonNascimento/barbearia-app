import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type PanelModuleCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
  metric?: string;
  detail?: string;
  active?: boolean;
};

export default function PanelModuleCard({
  href,
  icon: Icon,
  title,
  description,
  eyebrow,
  metric,
  detail,
  active = false,
}: PanelModuleCardProps) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-[28px] border p-5 transition duration-200 ${
        active
          ? "border-[#d4a15d]/70 bg-[linear-gradient(155deg,rgba(212,161,93,0.18),rgba(10,12,18,0.94)_48%,rgba(8,10,14,0.98))] shadow-[0_24px_70px_rgba(212,161,93,0.16)]"
          : "border-zinc-800 bg-[linear-gradient(160deg,rgba(24,27,37,0.94),rgba(11,12,18,0.98))] hover:border-zinc-700 hover:bg-[linear-gradient(160deg,rgba(31,35,48,0.98),rgba(11,12,18,0.98))]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#d4a15d]">
          <Icon className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <ArrowUpRight
          className={`h-5 w-5 transition ${
            active ? "text-[#d4a15d]" : "text-zinc-600 group-hover:text-zinc-300"
          }`}
          strokeWidth={1.9}
        />
      </div>

      <div className="mt-5">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">{eyebrow}</p>
        )}
        <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>

      {(metric || detail) && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          {metric && <p className="text-lg font-semibold text-white">{metric}</p>}
          {detail && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">{detail}</p>}
        </div>
      )}
    </Link>
  );
}
