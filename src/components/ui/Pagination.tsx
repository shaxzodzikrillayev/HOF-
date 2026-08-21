import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number; // 1-based
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const { t } = useTranslation();
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  for (let i = start; i < start + 3 && i <= totalPages; i++) pages.push(i);

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t('common.prev')}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-coffee transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-40 disabled:hover:border-border"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            'h-9 min-w-9 rounded-lg px-2 text-sm font-bold transition-all duration-200',
            value === page
              ? 'bg-espresso text-cream shadow-sm'
              : 'border border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
          )}
        >
          {value}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t('common.next')}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-coffee transition-colors hover:border-gold hover:text-gold-dark disabled:opacity-40 disabled:hover:border-border"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
