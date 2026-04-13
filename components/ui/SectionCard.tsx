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
      className={`surface-card rounded-lg p-4 sm:p-6 ${className}`.trim()}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-white sm:text-[1.35rem]">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>}
        </div>
        {actions}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
