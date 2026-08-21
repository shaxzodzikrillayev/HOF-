import { Heart } from 'lucide-react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { cn } from '@/lib/cn';

interface FavoriteButtonProps {
  itemId: string;
  className?: string;
}

export function FavoriteButton({ itemId, className }: FavoriteButtonProps) {
  const ids = useFavoritesStore((state) => state.ids);
  const toggle = useFavoritesStore((state) => state.toggle);
  const active = ids.includes(itemId);

  return (
    <button
      type="button"
      aria-label="Favorite"
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        toggle(itemId);
      }}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all duration-300 active:scale-90',
        active ? 'bg-white/95' : 'bg-white/85 hover:bg-white',
        className,
      )}
    >
      <Heart
        size={16}
        strokeWidth={2}
        className={cn(
          'transition-all duration-300',
          active ? 'fill-red-500 text-red-500 animate-pop' : 'text-espresso/70 hover:text-red-500',
        )}
      />
    </button>
  );
}
