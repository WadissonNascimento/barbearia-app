import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-sm text-zinc-300">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-zinc-400">{description}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-xl border border-white/10 px-4 py-2 font-semibold text-white transition hover:border-sky-400/40 hover:bg-sky-500/10"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
