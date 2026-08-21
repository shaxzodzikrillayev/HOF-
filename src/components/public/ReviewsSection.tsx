import { useMemo } from 'react';
import { MessageSquareQuote, Quote } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/format';
import { getReviews } from '@/services/reviewStorage';
import type { Review } from '@/types';
import { Reveal } from '@/components/ui/Reveal';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/cn';

const AVATAR_GRADIENTS = [
  'from-gold to-gold-dark',
  'from-espresso to-coffee',
  'from-mocha to-espresso',
  'from-gold-dark to-espresso',
  'from-coffee to-gold-dark',
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const { lang } = useTranslation();
  const text = lang === 'ru' ? review.text_ru || review.text_uz : review.text_uz || review.text_ru;
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <Reveal delay={(index % 3) * 110} className="h-full">
      <article className="group flex h-full flex-col rounded-3xl border border-border bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-lift sm:p-7">
        <Quote
          size={30}
          strokeWidth={1.2}
          className="absolute right-6 top-6 text-sand transition-colors duration-500 group-hover:text-gold-light/60"
          aria-hidden
        />
        <div className="flex items-center gap-3.5">
          {review.avatar_url ? (
            <img
              src={review.avatar_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-sand transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-sm font-bold text-white shadow-sm transition-transform duration-500 group-hover:scale-105',
                gradient,
              )}
              aria-hidden
            >
              {initials(review.author_name) || 'H'}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-espresso">{review.author_name}</p>
            <p className="mt-0.5 text-xs text-muted">{formatDate(review.visited_at, lang)}</p>
          </div>
        </div>

        <div className="mt-4">
          <Stars rating={review.rating} />
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-coffee">{text}</p>
      </article>
    </Reveal>
  );
}

export function ReviewsSection() {
  const { t } = useTranslation();

  const reviews = useMemo(() => getReviews({ onlyVisible: true }), []);
  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  return (
    <section id="reviews" className="scroll-mt-20 bg-cream py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em] text-gold">
              <MessageSquareQuote size={15} aria-hidden />
              HOFÉ · Café &amp; Market
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-espresso sm:text-5xl">
              {t('reviews.title')}
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted sm:text-base">
              {t('reviews.subtitle')}
            </p>
          </Reveal>

          {reviews.length > 0 && (
            <Reveal delay={150}>
              <div className="glass flex items-center gap-4 rounded-2xl border border-border px-5 py-4 shadow-card">
                <span className="font-display text-4xl font-bold text-gradient-gold">
                  {average.toFixed(1)}
                </span>
                <div>
                  <Stars rating={average} />
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                    {t('reviews.basedOn', { count: reviews.length })}
                  </p>
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {reviews.length === 0 ? (
          <Reveal className="mt-10">
            <div className="rounded-3xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold text-espresso">
                {t('reviews.empty')}
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
