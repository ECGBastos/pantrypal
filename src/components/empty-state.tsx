import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="paper-card flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
        <Icon size={28} aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-outline">{body}</p>
      </div>
      {action}
    </div>
  );
}
