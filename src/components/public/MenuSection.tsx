import { useMemo, useState } from 'react';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getLocalized } from '@/lib/format';
import type { Category, MenuItem } from '@/types';
import { DishCard } from './DishCard';
import { DishModal } from './DishModal';
import { EmptyState } from '@/components/ui/States';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

interface MenuSectionProps {
  categories: Category[];
  items: MenuItem[];
}

export function MenuSection({ categories, items }: MenuSectionProps) {
  const { lang, t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const visibleCategories = useMemo(
    () => categories.filter((category) => !category.hidden),
    [categories],
  );

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter((item) => item.category_id === activeCategory);
  }, [items, activeCategory]);

  const featuredItems = useMemo(
    () => filteredItems.filter((item) => item.featured),
    [filteredItems],
  );
  const regularItems = useMemo(
    () => filteredItems.filter((item) => !item.featured),
    [filteredItems],
  );

  return (
    <section id="menu" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-gold">
            HOFÉ · Café &amp; Market
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-espresso sm:text-5xl">
            {t('menu.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
            {t('menu.subtitle')}
          </p>
        </div>

        {visibleCategories.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={cn(
                'min-h-10 shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200',
                activeCategory === 'all'
                  ? 'border-espresso bg-espresso text-cream shadow-sm'
                  : 'border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
              )}
            >
              {t('menu.all')}
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'min-h-10 shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200',
                  activeCategory === category.id
                    ? 'border-espresso bg-espresso text-cream shadow-sm'
                    : 'border-border bg-white text-coffee hover:border-gold hover:text-gold-dark',
                )}
              >
                {getLocalized(category, 'name', lang)}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 space-y-12">
          {featuredItems.length > 0 && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="font-display text-xl font-bold text-espresso sm:text-2xl">
                  {t('menu.featured')}
                </h3>
                <span className="hidden h-px flex-1 bg-border sm:block" />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredItems.map((item, index) => (
                  <Reveal key={item.id} delay={(index % 4) * 90} className="h-full">
                    <DishCard item={item} onOpen={setSelectedItem} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {regularItems.length > 0 ? (
            <div
              className={cn(
                'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
                featuredItems.length === 0 && 'mt-0',
              )}
            >
              {regularItems.map((item, index) => (
                <Reveal key={item.id} delay={(index % 4) * 90} className="h-full">
                  <DishCard item={item} onOpen={setSelectedItem} />
                </Reveal>
              ))}
            </div>
          ) : (
            featuredItems.length === 0 && (
              <EmptyState icon={UtensilsCrossed} title={t('menu.empty')} />
            )
          )}
        </div>
      </div>

      {selectedItem && <DishModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  );
}
