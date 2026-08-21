import { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Language } from '@/types';
import { cartCount, useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { id: 'menu', key: 'nav.menu' as const },
  { id: 'about', key: 'nav.about' as const },
  { id: 'reviews', key: 'nav.reviews' as const },
];

function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useTranslation();
  const options: Array<{ value: Language; label: string; flag: string }> = [
    { value: 'ru', label: 'RU', flag: '🇷🇺' },
    { value: 'uz', label: 'UZ', flag: '🇺🇿' },
  ];

  return (
    <div
      className={cn(
        'flex items-center rounded-full border border-border bg-white/70 p-1',
        compact && 'w-fit',
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setLang(option.value)}
          className={cn(
            'flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold tracking-wide transition-all duration-200',
            lang === option.value
              ? 'bg-espresso text-cream shadow-sm'
              : 'text-mocha hover:text-espresso',
          )}
        >
          <span aria-hidden>{option.flag}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const openCart = useCartStore((state) => state.open);
  const lastAddedAt = useCartStore((state) => state.lastAddedAt);
  const [bump, setBump] = useState(false);

  const count = cartCount(lines);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (lastAddedAt === null) return;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 500);
    return () => window.clearTimeout(timer);
  }, [lastAddedAt]);

  const goTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-border/70 shadow-card' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex flex-col items-start leading-none"
        >
          <span className="font-display text-[22px] font-bold tracking-wide text-espresso transition-colors duration-300 group-hover:text-gold-dark">
            HOFÉ
          </span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-muted">
            Café &amp; Market
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className="group relative rounded-full px-4 py-2 text-sm font-semibold text-coffee transition-colors hover:bg-sand/80 hover:text-espresso"
            >
              {t(item.key)}
              <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gold transition-transform duration-300 group-hover:scale-x-100" />
            </button>
          ))}
          <div className="ml-2">
            <LangSwitcher />
          </div>
          <button
            type="button"
            onClick={openCart}
            aria-label={t('cart.title')}
            className="relative ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-espresso shadow-card transition-all duration-300 hover:border-gold hover:text-gold-dark active:scale-95"
          >
            <ShoppingBag size={18} strokeWidth={1.9} />
            {count > 0 && (
              <span
                className={cn(
                  'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white shadow-sm',
                  bump && 'animate-pop',
                )}
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={openCart}
            aria-label={t('cart.title')}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-espresso shadow-card transition-all duration-300 active:scale-95"
          >
            <ShoppingBag size={19} strokeWidth={1.9} />
            {count > 0 && (
              <span
                className={cn(
                  'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white shadow-sm',
                  bump && 'animate-pop',
                )}
              >
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full text-espresso transition-colors hover:bg-sand"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out md:hidden',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="glass border-t border-border px-4 pb-5 pt-3 shadow-lift">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={cn(
                  'rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold text-coffee transition-colors hover:bg-sand',
                  open && 'animate-slide-down',
                )}
              >
                {t(item.key)}
              </button>
            ))}
          </nav>
          <div className="mt-3 border-t border-border pt-4">
            <LangSwitcher compact />
          </div>
        </div>
      </div>
    </header>
  );
}
