import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-gold">
        <Icon size={26} strokeWidth={1.6} />
      </span>
      <p className="font-display text-lg font-semibold text-espresso">{title}</p>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
