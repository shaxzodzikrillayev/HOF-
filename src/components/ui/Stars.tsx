import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StarsProps {
  rating: number; // 0..5
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function Stars({ rating, size = 15, className, interactive = false, onChange }: StarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= Math.round(rating);
        const star = (
          <Star
            size={size}
            strokeWidth={1.6}
            className={cn(
              'transition-all duration-200',
              filled ? 'fill-gold text-gold' : 'fill-transparent text-border',
              interactive && 'hover:scale-125 hover:text-gold cursor-pointer',
            )}
          />
        );
        if (!interactive) return <span key={value}>{star}</span>;
        return (
          <button
            key={value}
            type="button"
            aria-label={`${value}`}
            onClick={() => onChange?.(value)}
            className="p-0.5"
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
