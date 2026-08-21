export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-gold/30 border-t-gold ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}
