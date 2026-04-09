export default function PanelModuleRail({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0 md:pb-0">
      <div className="flex min-w-max gap-4 md:grid md:min-w-0 md:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}
