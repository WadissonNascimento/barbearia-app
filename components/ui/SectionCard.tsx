export default function SectionCard({
  id,
  title,
  description,
  children,
  actions,
  className = "",
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${className}`.trim()}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
        </div>
        {actions}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
