import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, formatPrice, getLocalized } from '@/lib/format';
import { effectivePrice, hasDiscount, stockState } from '@/lib/pricing';
import { DISH_TAGS } from '@/lib/dishTags';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { getCategories } from '@/services/categoryService';
import { getItemReviews } from '@/services/reviewStorage';
import type { MenuItem } from '@/types';
import { FavoriteButton } from './FavoriteButton';
import { ReviewFormModal } from './ReviewFormModal';
import { Stars } from '@/components/ui/Stars';
import { cn } from '@/lib/cn';

const EXIT_MS = 240;

const AVATAR_GRADIENTS = [
  'from-gold to-gold-dark',
  'from-espresso to-coffee',
  'from-mocha to-espresso',
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

interface DishModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function DishModal({ item, onClose }: DishModalProps) {
  const { lang, t } = useTranslation();
  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewsVersion, setReviewsVersion] = useState(0);

  const add = useCartStore((state) => state.add);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = favoriteIds.includes(item.id);

  const reviewsRef = useRef<HTMLDivElement | null>(null);

  const name = getLocalized(item, 'name', lang);
  const description = getLocalized(item, 'description', lang);
  const gallery = useMemo(
    () => (item.images.length > 0 ? item.images : item.image_url ? [item.image_url] : []),
    [item.images, item.image_url],
  );
  const price = effectivePrice(item);
  const discounted = hasDiscount(item);
  const stock = stockState(item);
  const soldOut = !item.available || stock === 'out';

  const categories = useMemo(() => getCategories(), []);
  const category = categories.find((entry) => entry.id === item.category_id);
  const categoryName = category ? getLocalized(category, 'name', lang) : null;

  // Item-specific reviews are re-read after each submitted review.
  const reviews = useMemo(
    () => {
      void reviewsVersion;
      return getItemReviews(item.id);
    },
    [item.id, reviewsVersion],
  );
  const averageRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) /
        10
      : 0;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRendered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose(): void {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, EXIT_MS);
  }

  const handleAddToCart = () => {
    if (soldOut) return;
    add(item, quantity);
    handleClose();
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const stepImage = (delta: number) => {
    if (gallery.length < 2) return;
    setImageIndex((index) => (index + delta + gallery.length) % gallery.length);
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[95] flex items-end justify-center sm:items-center sm:p-6',
          'transition-opacity duration-200',
          rendered && !closing ? 'opacity-100' : 'opacity-0',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        <button
          type="button"
          aria-label={t('common.close')}
          onClick={handleClose}
          className="absolute inset-0 h-full w-full cursor-default bg-espresso/65 backdrop-blur-sm"
        />

        <div
          className={cn(
            'relative flex max-h-[94vh] w-full flex-col overflow-hidden bg-white shadow-lift',
            'rounded-t-3xl sm:max-h-[90vh] sm:max-w-4xl sm:flex-row sm:rounded-3xl',
            'transition-all duration-300 ease-out',
            rendered && !closing
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-10 scale-[0.97] opacity-0',
          )}
        >
          {/* ---------- Gallery ---------- */}
          <div className="relative shrink-0 sm:w-[46%]">
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:h-full sm:min-h-[560px]">
              <GalleryImage
                key={gallery[imageIndex] ?? 'empty'}
                src={gallery[imageIndex] ?? null}
                alt={name}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent sm:h-32" />

              {/* Top badges */}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {item.isNew && (
                  <span className="rounded-full bg-gold px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {t('badge.new')}
                  </span>
                )}
                {!item.available && (
                  <span className="glass-dark rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream">
                    {t('product.outOfStock')}
                  </span>
                )}
                {discounted && (
                  <span className="rounded-full bg-red-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm">
                    −{item.discount_percent}%
                  </span>
                )}
              </div>

              {/* Top actions */}
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <FavoriteButton itemId={item.id} />
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label={t('common.close')}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm transition hover:bg-white active:scale-90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepImage(-1)}
                    aria-label={t('common.prev')}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-espresso shadow-card backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-lift active:scale-90"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepImage(1)}
                    aria-label={t('common.next')}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-espresso shadow-card backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-lift active:scale-90"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="glass-dark absolute bottom-14 right-4 rounded-full px-2.5 py-1 text-[11px] font-bold text-cream">
                    {t('product.galleryOf', {
                      current: imageIndex + 1,
                      total: gallery.length,
                    })}
                  </span>
                </>
              )}

              {/* Dots */}
              {gallery.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
                  {gallery.map((image, index) => (
                    <button
                      key={image.slice(-24) + index}
                      type="button"
                      aria-label={`${index + 1}`}
                      onClick={() => setImageIndex(index)}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        index === imageIndex ? 'w-6 bg-gold' : 'w-1.5 bg-white/70 hover:bg-white',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/10 bg-espresso p-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:border-0 sm:bg-gradient-to-t sm:from-black/45 sm:to-transparent">
                {gallery.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={cn(
                      'h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-12 sm:w-12',
                      index === imageIndex
                        ? 'border-gold opacity-100 shadow-lift'
                        : 'border-white/50 opacity-70 hover:opacity-100',
                    )}
                  >
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Info ---------- */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
              {/* Category + meta */}
              <div className="flex flex-wrap items-center gap-2">
                {categoryName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-coffee">
                    {categoryName}
                  </span>
                )}
                {stock === 'ok' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t('product.inStock')}
                  </span>
                )}
                {stock === 'low' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {t('product.lowStock', { count: item.stock ?? 0 })}
                  </span>
                )}
                {item.weight && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {item.weight}
                  </span>
                )}
              </div>

              {/* Name + price */}
              <div className="mt-3 flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl font-bold leading-tight text-espresso sm:text-[28px]">
                  {name}
                </h3>
                <div className="shrink-0 text-right">
                  <span
                    className={cn(
                      'whitespace-nowrap font-display text-xl font-bold sm:text-2xl',
                      discounted ? 'text-red-600' : 'text-espresso',
                    )}
                  >
                    {formatPrice(price, lang)}
                  </span>
                  {discounted && (
                    <span className="mt-0.5 block text-sm font-medium text-muted line-through">
                      {formatPrice(item.price, lang)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating summary */}
              <button
                type="button"
                onClick={scrollToReviews}
                className="mt-3 flex items-center gap-2 rounded-full py-1 pr-3 text-left transition-colors hover:bg-sand/60"
              >
                {reviews.length > 0 ? (
                  <>
                    <Stars rating={averageRating} size={16} />
                    <span className="text-sm font-bold text-espresso">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs font-medium text-muted">
                      · {t('product.reviewsCount', { count: reviews.length })}
                    </span>
                  </>
                ) : (
                  <>
                    <Star size={15} className="fill-sand text-sand" />
                    <span className="text-xs font-medium text-muted">{t('product.noReviews')}</span>
                  </>
                )}
              </button>

              {/* Description */}
              {description && (
                <p className="mt-4 text-[15px] leading-relaxed text-coffee">{description}</p>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => {
                    const meta = DISH_TAGS.find((entry) => entry.value === tag);
                    if (!meta) return null;
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-coffee"
                      >
                        <span aria-hidden>{meta.emoji}</span>
                        {t(meta.labelKey)}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* ---------- Reviews ---------- */}
              <div ref={reviewsRef} className="scroll-mt-4 border-t border-border pt-5 mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-display text-lg font-bold text-espresso">
                    {t('product.reviews')}
                    {reviews.length > 0 && (
                      <span className="ml-2 text-sm font-semibold text-muted">
                        {averageRating.toFixed(1)} ·{' '}
                        {t('product.reviewsCount', { count: reviews.length })}
                      </span>
                    )}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setReviewFormOpen(true)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-4 text-xs font-bold text-gold-dark transition-all duration-200 hover:bg-gold hover:text-white active:scale-95"
                  >
                    <Star size={13} />
                    {t('product.leaveReview')}
                  </button>
                </div>

                {reviews.length === 0 ? (
                  <p className="mt-4 rounded-2xl border border-dashed border-border bg-cream/60 px-4 py-6 text-center text-sm text-muted">
                    {t('product.noReviews')}
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {reviews.map((review, index) => {
                      const text =
                        lang === 'ru'
                          ? review.text_ru || review.text_uz
                          : review.text_uz || review.text_ru;
                      return (
                        <li
                          key={review.id}
                          className="animate-fade-up rounded-2xl border border-border bg-cream/50 p-4"
                          style={{ animationDelay: `${Math.min(index * 60, 240)}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-xs font-bold text-white',
                                AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
                              )}
                              aria-hidden
                            >
                              {initials(review.author_name) || 'H'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-espresso">
                                {review.author_name}
                              </p>
                              <p className="text-[11px] text-muted">
                                {formatDate(review.visited_at, lang)}
                              </p>
                            </div>
                            <Stars rating={review.rating} size={13} />
                          </div>
                          {text && (
                            <p className="mt-2.5 text-sm leading-relaxed text-coffee">{text}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Stock note */}
              {stock === 'untracked' && item.available && (
                <p className="mt-5 flex items-center gap-1.5 text-xs text-muted">
                  <Info size={13} aria-hidden />
                  {t('product.inStock')}
                </p>
              )}
            </div>

            {/* Sticky action bar */}
            <div className="shrink-0 border-t border-border bg-white px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="−"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-coffee transition-colors hover:bg-sand disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center text-base font-bold text-espresso">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    aria-label="+"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-coffee transition-colors hover:bg-sand"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={soldOut}
                  className={cn(
                    'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all duration-300 active:scale-[0.98]',
                    soldOut
                      ? 'cursor-not-allowed bg-sand text-muted'
                      : 'bg-espresso text-cream shadow-card hover:bg-gold hover:shadow-lift',
                  )}
                >
                  <ShoppingBag size={16} />
                  {soldOut ? t('menu.unavailable') : t('cart.addToCart')}
                  {!soldOut && (
                    <span className="opacity-80">· {formatPrice(price * quantity, lang)}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(item.id)}
                  aria-pressed={isFavorite}
                  aria-label="Favorite"
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 active:scale-90',
                    isFavorite
                      ? 'border-red-200 bg-red-50'
                      : 'border-border bg-white hover:border-red-200 hover:bg-red-50/50',
                  )}
                >
                  <Heart
                    size={19}
                    strokeWidth={2}
                    className={cn(
                      'transition-all duration-300',
                      isFavorite ? 'fill-red-500 text-red-500 animate-pop' : 'text-mocha',
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviewFormOpen && (
        <ReviewFormModal
          itemId={item.id}
          itemName={name}
          onSaved={() => setReviewsVersion((v) => v + 1)}
          onClose={() => setReviewFormOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Main gallery image with shimmering skeleton while loading and a branded
 * gradient fallback when the source is missing or fails.
 */
function GalleryImage({ src, alt }: { src: string | null; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #3B2D23 0%, #221913 55%, #B08A44 160%)' }}
      >
        <span className="flex h-full w-full items-center justify-center font-display text-3xl text-gold-light/70">
          HOFÉ
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-coffee via-espresso to-coffee" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'animate-fade-in opacity-100' : 'opacity-0',
        )}
      />
    </>
  );
}
