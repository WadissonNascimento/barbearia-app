export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--brand-strong)] sm:text-xs">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-zinc-400 sm:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {actions ? <div className="flex flex-wrap gap-3 sm:justify-start lg:justify-end">{actions}</div> : null}
    </div>
  );
}
