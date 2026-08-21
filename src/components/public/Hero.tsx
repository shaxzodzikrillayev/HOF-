import { useMemo } from 'react';
import { ArrowDown, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getReviews } from '@/services/reviewStorage';
import { Button } from '@/components/ui/Button';

export function Hero() {
  const { t } = useTranslation();

  const rating = useMemo(() => {
    const reviews = getReviews({ onlyVisible: true });
    if (reviews.length === 0) return null;
    return {
      average: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
      count: reviews.length,
    };
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80"
        alt="HOFÉ café interior"
        className="absolute inset-0 h-full w-full animate-kenburns object-cover will-change-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/60 to-espresso/85" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-32 text-center sm:px-6 lg:px-8">
        <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.35em] text-gold-light sm:text-sm">
          {t('hero.greeting')}
        </p>
        <h1 className="mt-6 animate-fade-up font-display text-6xl font-bold tracking-wide text-cream [animation-delay:120ms] sm:text-7xl md:text-8xl">
          HOFÉ
        </h1>
        <p className="mt-4 animate-fade-up text-sm font-semibold uppercase tracking-[0.5em] text-gold-light [animation-delay:220ms] sm:text-base">
          Café &amp; Market
        </p>

        {rating && (
          <div
            className="glass-dark mx-auto mt-7 flex w-fit animate-scale-in items-center gap-2.5 rounded-full border border-white/15 px-5 py-2.5 [animation-delay:300ms]"
          >
            <Star size={16} className="fill-gold text-gold" aria-hidden />
            <span className="font-display text-lg font-bold text-cream">{rating.average}</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-cream/70">
              · {t('reviews.basedOn', { count: rating.count })}
            </span>
          </div>
        )}

        <p className="mx-auto mt-8 max-w-xl animate-fade-up text-base leading-relaxed text-cream/85 [animation-delay:320ms] sm:text-lg">
          {t('hero.tagline')}
        </p>
        <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:420ms] sm:flex-row">
          <Button variant="gold" size="lg" onClick={() => scrollTo('menu')}>
            {t('nav.viewMenu')}
            <ArrowDown size={17} />
          </Button>
          <button
            type="button"
            onClick={() => scrollTo('reviews')}
            className="min-h-12 rounded-full border border-cream/30 px-7 text-sm font-bold text-cream backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-white/10 hover:text-gold-light active:scale-[0.98]"
          >
            {t('nav.reviews')}
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
