import { useEffect, useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { Star } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { addReview } from '@/services/reviewStorage';
import { toast } from '@/store/toastStore';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/cn';

const EXIT_MS = 200;

interface ReviewFormModalProps {
  itemId: string;
  itemName: string;
  onSaved?: () => void;
  onClose: () => void;
}

/**
 * Public "leave a review" form for a specific dish.
 * Validates input, saves the review to storage, notifies and closes.
 */
export function ReviewFormModal({ itemId, itemName, onSaved, onClose }: ReviewFormModalProps) {
  const { lang, t } = useTranslation();
  const [rendered, setRendered] = useState(false);
  const [closing, setClosing] = useState(false);

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setRendered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose(): void {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, EXIT_MS);
  }

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t('reviewForm.errorName');
    if (text.trim().length < 2) nextErrors.text = t('reviewForm.errorText');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || submitting) return;

    setSubmitting(true);
    try {
      // The same text is stored for both languages — visitors read their own.
      const value = text.trim();
      addReview({
        item_id: itemId,
        author_name: name.trim(),
        rating,
        text_ru: value,
        text_uz: value,
        avatar_url: null,
        visited_at: new Date().toISOString(),
        visible: true,
      });
      toast.success(t('reviewForm.thanks'));
      onSaved?.();
      handleClose();
    } catch (err) {
      toast.error(getErrorMessage(err) || t('reviewForm.error'));
      setSubmitting(false);
    }
  };

  const activeStar = hoveredRating ?? rating;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[98] flex items-end justify-center sm:items-center sm:p-6',
        'transition-opacity duration-200',
        rendered && !closing ? 'opacity-100' : 'opacity-0',
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t('reviewForm.title')}
    >
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={handleClose}
        className="absolute inset-0 h-full w-full cursor-default bg-espresso/60 backdrop-blur-sm"
      />

      <div
        className={cn(
          'relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-white shadow-lift',
          'rounded-t-3xl sm:max-w-lg sm:rounded-3xl',
          'transition-all duration-200 ease-out',
          rendered && !closing
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-8 scale-[0.97] opacity-0',
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h3 className="font-display text-xl font-bold text-espresso">
              {t('reviewForm.title')}
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted">
              {t('reviewForm.subtitle')} · {itemName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('common.close')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-espresso active:scale-90"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {/* Name */}
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-coffee">
              {t('reviewForm.name')}
            </span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              maxLength={60}
              placeholder={lang === 'ru' ? 'Например: Анна' : 'Masalan: Anna'}
              className={cn(
                'h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-espresso outline-none transition-colors placeholder:text-muted/60 focus:ring-2 focus:ring-gold/40',
                errors.name ? 'border-red-400' : 'border-border focus:border-gold',
              )}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>
            )}
          </label>

          {/* Star rating */}
          <div className="mt-5">
            <span className="mb-1.5 block text-[13px] font-bold text-coffee">
              {t('reviewForm.rating')}
            </span>
            <div className="flex items-center gap-1.5" onMouseLeave={() => setHoveredRating(null)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value}`}
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  className="rounded-full p-1 transition-transform duration-150 hover:scale-125 active:scale-95"
                >
                  <Star
                    size={30}
                    strokeWidth={1.5}
                    className={cn(
                      'transition-colors duration-150',
                      value <= activeStar
                        ? 'fill-gold text-gold drop-shadow-sm'
                        : 'fill-transparent text-border',
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 font-display text-xl font-bold text-espresso">
                {rating}
              </span>
            </div>
          </div>

          {/* Text */}
          <label className="mt-5 block">
            <span className="mb-1.5 block text-[13px] font-bold text-coffee">
              {t('reviewForm.text')}
            </span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errors.text) setErrors((prev) => ({ ...prev, text: undefined }));
              }}
              rows={4}
              maxLength={600}
              placeholder={t('reviewForm.textPlaceholder')}
              className={cn(
                'w-full resize-none rounded-xl border bg-white px-4 py-3 text-[15px] leading-relaxed text-espresso outline-none transition-colors placeholder:text-muted/60 focus:ring-2 focus:ring-gold/40',
                errors.text ? 'border-red-400' : 'border-border focus:border-gold',
              )}
            />
            {errors.text && (
              <p className="mt-1.5 text-xs font-medium text-red-600">{errors.text}</p>
            )}
          </label>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-cream/60 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-gold-dark active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('reviewForm.sending')}
              </>
            ) : (
              <>
                <Send size={15} />
                {t('reviewForm.submit')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
