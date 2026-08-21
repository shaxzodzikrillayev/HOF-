import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-sand via-border/60 to-sand bg-[length:400px_100%]',
        className,
      )}
      aria-hidden
    />
  );
}
