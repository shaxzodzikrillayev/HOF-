import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice, getLocalized } from '@/lib/format';
import { effectivePrice, hasDiscount, stockState } from '@/lib/pricing';
import { DISH_TAGS } from '@/lib/dishTags';
import { useCartStore } from '@/store/cartStore';
import type { MenuItem } from '@/types';
import { SmartImage } from './SmartImage';
import { FavoriteButton } from './FavoriteButton';
import { cn } from '@/lib/cn';

interface DishCardProps {
  item: MenuItem;
  onOpen?: (item: MenuItem) => void;
}

export function DishCard({ item, onOpen }: DishCardProps) {
  const { lang, t } = useTranslation();
  const [added, setAdded] = useState(false);
  const add = useCartStore((state) => state.add);

  const name = getLocalized(item, 'name', lang);
  const description = getLocalized(item, 'description', lang);
  const price = effectivePrice(item);
  const discounted = hasDiscount(item);
  const stock = stockState(item);
  const soldOut = !item.available || stock === 'out';

  const handleAdd = () => {
    if (soldOut) return;
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 600);
  };

  return (
    <article
      onClick={onOpen ? () => onOpen(item) : undefined}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-lift',
        onOpen && 'cursor-pointer',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={item.image_url}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.isNew && (
            <span className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              {t('badge.new')}
            </span>
          )}
          {!item.available && (
            <span className="glass-dark rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream">
              {t('menu.unavailable')}
            </span>
          )}
        </div>

        {/* Discount + favorite */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {discounted && (
            <span className="rounded-full bg-red-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
              −{item.discount_percent}%
            </span>
          )}
          <FavoriteButton itemId={item.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold leading-snug text-espresso transition-colors duration-300 group-hover:text-gold-dark">
            {name}
          </h3>
          <div className="shrink-0 text-right">
            <span
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold',
                discounted ? 'bg-red-50 text-red-600' : 'bg-sand text-coffee',
              )}
            >
              {formatPrice(price, lang)}
            </span>
            {discounted && (
              <span className="mt-1 block text-xs font-medium text-muted line-through">
                {formatPrice(item.price, lang)}
              </span>
            )}
          </div>
        </div>

        {description && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}

        {(item.tags.length > 0 || item.weight || stock === 'low') && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
            {item.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => {
                  const meta = DISH_TAGS.find((entry) => entry.value === tag);
                  if (!meta) return null;
                  return (
                    <span
                      key={tag}
                      title={t(meta.labelKey)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-cream px-2 py-0.5 text-[11px] font-semibold text-coffee"
                    >
                      <span aria-hidden>{meta.emoji}</span>
                      {t(meta.labelKey)}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {stock === 'low'
                  ? t('menu.lowStock', { count: item.stock ?? 0 })
                  : item.weight}
              </span>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleAdd();
              }}
              disabled={soldOut}
              aria-label={t('cart.add')}
              title={soldOut ? t('menu.unavailable') : t('cart.add')}
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 active:scale-90',
                soldOut
                  ? 'cursor-not-allowed bg-sand text-muted'
                  : added
                    ? 'scale-110 bg-emerald-500 text-white'
                    : 'bg-espresso text-cream hover:bg-gold hover:shadow-lift md:opacity-0 md:group-hover:opacity-100',
              )}
            >
              <Plus size={17} strokeWidth={2.4} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
